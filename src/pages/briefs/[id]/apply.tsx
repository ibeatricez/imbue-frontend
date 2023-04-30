/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import MilestoneItem from "@/components/Briefs/MileStoneItem";
import { timeData } from "@/config/briefs-data";
import * as config from "@/config";
import { Brief, Currency, User } from "@/model";
import { getBrief, getFreelancerBrief } from "@/redux/services/briefService";
import { BriefInsights } from "@/components/Briefs/BriefInsights";
import AccountChoice from "@/components/AccountChoice";
import { checkEnvironment, getCurrentUser, redirect } from "@/utils";
import { getFreelancerProfile } from "@/redux/services/freelancerService";
import { selectAccount } from "@/redux/services/polkadotService";
import { useRouter } from "next/router";
import FullScreenLoader from "@/components/FullScreenLoader";
import { WalletAccount } from "@talismn/connect-wallets";

interface MilestoneItem {
  name: string;
  amount: number | undefined;
}

export const SubmitProposal = (): JSX.Element => {
  const [currencyId, setCurrencyId] = useState(0);
  const [brief, setBrief] = useState<Brief | any>();
  const [user, setUser] = useState<User>();
  // const userHasWeb3Addresss = !!user?.web3_address;
  const [showPolkadotAccounts, setShowPolkadotAccounts] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const briefId: any = router?.query?.id || 0;

  useEffect(() => {
    getUserAndFreelancer();
  }, [briefId, user]);

  useEffect(() => {
    getCurrentUserBrief();
  }, [user]);

  const getUserAndFreelancer = async () => {
    const userResponse = await getCurrentUser();
    setUser(userResponse);
    const freelancer = await getFreelancerProfile(userResponse?.username);
    if (!freelancer) {
      router.push(`/freelancers/new`);
    }
  };

  const getCurrentUserBrief = async () => {
    if (briefId && user) {
      const userApplication: any = await getFreelancerBrief(user?.id, briefId);
      if (userApplication) {
        router.push(`/briefs/${briefId}/applications/${userApplication?.id}/`);
      }
      const briefResponse: Brief | undefined = await getBrief(briefId);
      setBrief(briefResponse);
    }
  };

  const currencies = Object.keys(Currency).filter(
    (key: any) => !isNaN(Number(Currency[key]))
  );
  const imbueFeePercentage = 5;

  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { name: "", amount: undefined },
  ]);

  const durationOptions = timeData.sort((a, b) =>
    a.value > b.value ? 1 : a.value < b.value ? -1 : 0
  );

  const totalCostWithoutFee = milestones.reduce(
    (acc, { amount }) => acc + (amount ?? 0),
    0
  );
  const imbueFee = (totalCostWithoutFee * imbueFeePercentage) / 100;
  const totalCost = imbueFee + totalCostWithoutFee;

  const onAddMilestone = () => {
    setMilestones([...milestones, { name: "", amount: undefined }]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyId(Number(event.target.value));
  };

  const handleSelectAccount = async (account: WalletAccount) => {
    setLoading(true);
    await selectAccount(account);
    setLoading(false);
    setShowPolkadotAccounts(false);
    await insertProject();
  };

  async function handleSubmit() {
    if (!user?.web3_address) {
      setShowPolkadotAccounts(true);
    } else {
      await insertProject();
    }
  }

  async function insertProject() {
    //TODO: validate all milestone sum up to 100%
    setLoading(true);
    const resp = await fetch(
      checkEnvironment().concat(`${config.apiBase}/project`),
      {
        headers: config.postAPIHeaders,
        method: "post",
        body: JSON.stringify({
          user_id: user?.id,
          name: `Brief Application: ${brief?.headline}`,
          brief_id: brief?.id,
          total_cost_without_fee: totalCostWithoutFee,
          imbue_fee: imbueFee,
          currency_id: currencyId,
          milestones: milestones
            .filter((m) => m.amount !== undefined)
            .map((m) => {
              return {
                name: m.name,
                amount: m.amount,
                percentage_to_unlock: (
                  ((m.amount ?? 0) / totalCostWithoutFee) *
                  100
                ).toFixed(0),
              };
            }),
          required_funds: totalCost,
        }),
      }
    );
    if (resp.ok) {
      const applicationId = (await resp.json()).id;
      applicationId &&
        router.push(`/briefs/${brief?.id}/applications/${applicationId}/`);
    } else {
      console.log("Failed to submit the brief");
    }
    setLoading(false);
  }

  const renderPolkadotJSModal = (
    <div>

    </div>
  );

  const totalPercent = milestones.reduce((sum, { amount }) => {
    const percent = Number(
      ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
    );
    return sum + percent;
  }, 0);

  const allAmountAndNamesHaveValue = () => {
    for (let i = 0; i < milestones.length; i++) {
      const { amount, name } = milestones[i];

      if (
        amount === undefined ||
        amount === null ||
        amount === 0 ||
        name === undefined ||
        name === null ||
        name.length === 0
      ) {
        return false;
      }
    }

    return true;
  };

  const milestoneAmountsAndNamesHaveValue = allAmountAndNamesHaveValue();

  return (
    <div className="flex flex-col gap-10 text-base leading-[1.5] hq-layout">
      <div>
        <h3 className="ml-8 mb-2 text-xl leading-[1.5] font-bold m-0 p-0  flex">
          Job description
        </h3>
        {brief && <BriefInsights brief={brief} />}
      </div>
      <div>
        <div className="milestones border border-white py-5 rounded-[20px] bg-theme-grey-dark">
          <div className="flex flex-col lg:flex-row justify-between mx-14 -mb-3">
            <h3 className="text-xl leading-[1.5] font-bold m-0 p-0 flex">
              Milestones
            </h3>
            <h3 className="text-xl leading-[1.5] font-bold m-0 p-0">
              Client&apos;s budget: ${Number(brief?.budget)?.toLocaleString()}
            </h3>
          </div>
          <hr className="separator" />

          <p className="mx-14 text-xl font-bold">
            How many milestone do you want to include?
          </p>
          <div className="milestone-list mx-14">
            {milestones.map(({ name, amount }, index) => {
              const percent = Number(
                ((100 * (amount ?? 0)) / totalCostWithoutFee).toFixed(0)
              );
              return (
                <div className="milestone-row !p-0" key={index}>
                  <div className="milestone-no text-base">{index + 1}</div>
                  <div className="flex flex-col lg:flex-row justify-between w-full">
                    <div className="w-full lg:w-1/2">
                      <h3 className="mb-5 text-xl font-bold m-0 p-0">
                        Description
                      </h3>
                      <textarea
                        className="input-description bg-[#1a1a19] border border-white text-base leading-5 py-3 px-5"
                        value={name}
                        onChange={(e) =>
                          setMilestones([
                            ...milestones.slice(0, index),
                            {
                              ...milestones[index],
                              name: e.target.value,
                            },
                            ...milestones.slice(index + 1),
                          ])
                        }
                      />
                    </div>
                    <div className="flex flex-col w-[fit-content] lg:items-end">
                      <h3 className="mb-5 text-xl font-bold m-0 p-0">
                        Amount
                      </h3>
                      <input
                        type="number"
                        className="input-budget bg-[#1a1a19] border border-white text-base leading-5 rounded-[5px] py-3 px-5"
                        value={amount || ""}
                        onChange={(e) =>
                          setMilestones([
                            ...milestones.slice(0, index),
                            {
                              ...milestones[index],
                              amount: Number(e.target.value),
                            },
                            ...milestones.slice(index + 1),
                          ])
                        }
                      />
                      {totalCostWithoutFee !== 0 && (
                        <div className="flex flex-col items-end mt-3 gap-2 w-full">
                          <div className="progress-value text-base">
                            {percent}%
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress"
                              style={{
                                width: `${percent}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p
            className="clickable-text btn-add-milestone mx-14 !mb-0 text-xl font-bold"
            onClick={onAddMilestone}
          >
            <FiPlusCircle color="var(--theme-primary)" />
            Add milestone
          </p>
          <hr className="separator" />

          <div className="flex flex-row items-center mb-5 mx-14">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">
                Total price of the project
              </h3>
              <div className="text-inactive">
                This includes all milestonees, and is the amount client will see
              </div>
            </div>
            <div className="budget-value">
              ${Number(totalCostWithoutFee.toFixed(2)).toLocaleString()}
            </div>
          </div>
          <hr className="separator" />

          <div className="flex flex-row items-center mb-5 mx-14">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">
                Imbue Service Fee 5% - Learn more about Imbue’s fees
              </h3>
            </div>
            <div className="budget-value">
              ${Number(imbueFee.toFixed(2)).toLocaleString()}
            </div>
          </div>
          <hr className="separator" />

          <div className="flex flex-row items-center mb-5 mx-14">
            <div className="flex flex-col flex-grow">
              <h3 className="text-xl font-bold m-0 p-0">Total</h3>
            </div>
            <div className="budget-value">
              ${Number(totalCost.toFixed(2)).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="ml-8 mb-2 text-xl font-bold m-0 p-0 flex">
          Payment terms
        </h3>
        <div className="bg-theme-grey-dark border border-white py-5 rounded-[20px] flex flex-col lg:flex-row lg:justify-between gap-3 px-14">
          <div className="duration-selector">
            <h3 className="text-xl font-bold m-0 p-0">
              How long will this project take?
            </h3>
            <select
              name="duration"
              className="bg-[#1a1a19] round border border-white rounded-[5px] text-base px-5 py-3 mt-4"
              placeholder="Select a duration"
              required
            >
              {durationOptions.map(({ label, value }, index) => (
                <option value={value} key={index} className="duration-option">
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="payment-options">
            <h3 className="text-xl font-bold m-0 p-0">Currency</h3>

            <div className="network-amount">
              <select
                name="currencyId"
                onChange={handleChange}
                placeholder="Select a currency"
                className="bg-[#1a1a19] round border border-white rounded-[5px] text-base px-5 py-3 mt-4"
                required
              >
                {currencies.map((currency: any) => (
                  <option
                    value={Currency[currency]}
                    key={Currency[currency]}
                    className="duration-option"
                  >
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="buttons-container">
        <button
          disabled={totalPercent !== 100 || !milestoneAmountsAndNamesHaveValue}
          className="primary-btn in-dark w-button"
          onClick={() => handleSubmit()}
        >
          Submit
        </button>
        {/* TODO: Add Drafts Functionality */}
        {/* <button className="secondary-btn">Save draft</button> */}
      </div>
      <AccountChoice
        accountSelected={(account: WalletAccount) =>
          handleSelectAccount(account)
        }
        visible={showPolkadotAccounts}
        setVisible={setShowPolkadotAccounts}

      />
      {loading && <FullScreenLoader />}
    </div>
  );
};

export default SubmitProposal;
