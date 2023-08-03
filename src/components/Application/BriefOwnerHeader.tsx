/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Badge, Menu, MenuItem, useMediaQuery } from '@mui/material';
import { SignerResult } from '@polkadot/api/types';
import { WalletAccount } from '@talismn/connect-wallets';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { getBalance } from '@/utils/helper';

import {
  applicationStatusId,
  Brief,
  Currency,
  Freelancer,
  OffchainProjectState,
  Project,
} from '@/model';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';

import AccountChoice from '../AccountChoice';
import BackButton from '../BackButton';
import ErrorScreen from '../ErrorScreen';
import { HirePopup } from '../HirePopup';

interface MilestoneItem {
  name: string;
  amount: number | undefined;
}

type BriefOwnerHeaderProps = {
  brief: Brief;
  freelancer: Freelancer;
  application: Project | any;
  handleMessageBoxClick: (_userId: number, _freelancer: any) => void;
  updateApplicationState: (
    _application: any,
    _projectStatus: OffchainProjectState
  ) => void;
  milestones: MilestoneItem[];
  totalCostWithoutFee: number;
  imbueFee: number;
  totalCost: number;
  setLoading: (_loading: boolean) => void;
  openAccountChoice: boolean;
  setOpenAccountChoice: (_loading: boolean) => void;
  user: any;
};

const BriefOwnerHeader = (props: BriefOwnerHeaderProps) => {
  const {
    brief,
    freelancer,
    application,
    handleMessageBoxClick,
    updateApplicationState,
    milestones,
    totalCostWithoutFee,
    imbueFee,
    totalCost,
    setLoading,
    openAccountChoice,
    setOpenAccountChoice,
    user,
  } = props;

  const [balance, setBalance] = useState<string>();
  const [imbueBalance, setImbueBalance] = useState<string>();
  const [loadingWallet, setLoadingWallet] = useState<string>("");
  const [error, setError] = useState<any>();

  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const router = useRouter();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleOptionsClose = () => {
    setAnchorEl(null);
  };

  const accountSelected = async (account: WalletAccount): Promise<any> => {
    try {
      setLoadingWallet('connecting');
      const result = await getAccountAndSign(account);
      const resp = await authorise(
        result?.signature as SignerResult,
        result?.challenge as string,
        account
      );
      if (resp.status === 200 || resp.status === 201) {
        const bl = await getBalance(
          account.address,
          application.currency_id,
          user
        );
        setBalance(bl);
      } else {
        setError({ message: 'Could not connect wallet. Please Try again' });
      }
    } catch (error) {
      setError({ message: error });
    } finally {
      setLoadingWallet('');
    }
  };

  useEffect(() => {
    const showBalance = async () => {
      try {
        setLoadingWallet('loading');
        const balance = await getBalance(
          user?.web3_address,
          application?.currency_id ?? Currency.IMBU,
          user
        );
        const imbueBalance = await getBalance(
          user?.web3_address,
          Currency.IMBU,
          user
        );
        setBalance(balance.toLocaleString());
        setImbueBalance(imbueBalance.toLocaleString());
      } catch (error) {
        setError({ message: error });
      } finally {
        setLoadingWallet('');
      }
    };
    user?.web3_address && showBalance();
  }, [user?.web3_address, application?.currency_id]);

  const mobileView = useMediaQuery('(max-width:480px)');

  return (
    <div className='flex items-center w-full md:justify-between lg:px-10 flex-wrap gap-4'>
      <div className='flex items-center'>
        <BackButton />
        <div className='flex gap-6 items-start'>
          <Image
            onClick={() => router.push(`/freelancers/${freelancer?.username}`)}
            className='w-16 h-16 rounded-full object-cover cursor-pointer'
            src={freelancer?.profile_image ?? require('@/assets/images/profile-image.png')}
            height={200}
            width={200}
            priority
            alt='profileImage'
          />
          <div>
            <Badge
              badgeContent={'Hired'}
              color='primary'
              invisible={
                !(application?.status_id === OffchainProjectState.Accepted)
              }
            >
              <p className='text-[1.25rem] font-normal capitalize text-imbue-purple'>
                {freelancer?.display_name}
              </p>
            </Badge>
            {/* 
          <div className='flex items-center mt-[1rem]'>
            <Image
              className='h-4 w-6 object-cover'
              height={16}
              width={24}
              src='https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg'
              alt='Flag'
            />
            
            <h3 className='ml-2 text-imbue-purple text-[1rem] !font-normal'>
              Los Angeles, United State
            </h3>
          </div> */}

            <p className='text-sm text-content-primary lg:text-center break-words'>
              @
              {mobileView && freelancer?.username?.length > 16
                ? `${freelancer?.username?.substring(0, 16)}...`
                : freelancer?.username}
            </p>


          </div>
        </div>
      </div>


      <div className='flex flex-col justify-center lg:items-center'>
        {application?.currency_id !== Currency.IMBU
          ? (
            <p className='text-sm mt-4 text-imbue-purple'>
              {loadingWallet === 'loading' && 'Loading Wallet...'}
              {loadingWallet === 'connecting' && 'Connecting Wallet...'}
              {!loadingWallet &&
                (balance === undefined
                  ? 'No wallet found'
                  : `Your Balance: ${balance} $${Currency[application?.currency_id ?? 0]
                  }`)}
            </p>
          )
          : (
            <p className='text-sm lg:text-base mt-2 text-imbue-purple'>
              {loadingWallet === 'loading' && 'Loading Wallet...'}
              {loadingWallet === 'connecting' && 'Connecting Wallet...'}
              {!loadingWallet &&
                (balance === undefined
                  ? 'No wallet found'
                  : `Your Balance: ${imbueBalance} $${Currency[Currency.IMBU]}`)}
            </p>
          )
        }

        {/* <div className='rating flex justify-center gap-4 mt-2 lg:mt-6'>
          <p className=''>
            <FaStar color='#BAFF36' />
            <FaStar color='#BAFF36' />
            <FaStar color='#BAFF36' />
            <FaStar color='#E1DDFF' />
          </p>
          <p className='text-imbue-purple font-normal'>
            <span>Top Rated</span>
            <span className='review-count ml-1 text-imbue-purple font-normal'>
              (1,434 reviews)
            </span>
          </p>
        </div> */}
      </div>

      <div className='relative flex flex-wrap items-center gap-3'>
        <button
          className='primary-btn in-dark w-button !px-5 !mr-0 !bg-[#BAFF36] !text-imbue-purple in-dark'
          onClick={() =>
            application.user_id &&
            handleMessageBoxClick(application?.user_id, freelancer?.username)
          }
        >
          Message
        </button>



        {loadingWallet || balance !== undefined ? (
          <>
            <button
              id='demo-customized-button'
              aria-controls={open ? 'demo-customized-menu' : undefined}
              aria-haspopup='true'
              aria-expanded={open ? 'true' : undefined}
              onClick={handleOptionsClick}
              className='primary-btn in-dark w-button !mr-0 hover:!bg-content-primary hover:!text-white'
              disabled={loadingWallet ? true : false}
            >
              {loadingWallet ? (
                'Please Wait...'
              ) : (
                <>
                  Options
                  <KeyboardArrowDownIcon fontSize='small' className='ml-2' />
                </>
              )}
            </button>
            <button
              className={`${applicationStatusId[application?.status_id]
                }-btn in-dark text-xs lg:text-base rounded-full py-3 px-3 lg:px-6 lg:py-[10px]`}
            >
              {applicationStatusId[application?.status_id]}
            </button>
          </>

        ) : (
          <button
            onClick={() => setOpenAccountChoice(true)}
            className='primary-btn in-dark w-button !text-xs lg:!text-base'
          >
            Connect Wallet
          </button>
        )}
        <Menu
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleOptionsClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem
            onClick={() => {
              handleOptionsClose();
              router.push(`/freelancers/${freelancer?.username}/`);
            }}
            className='!text-imbue-purple'
          >
            Freelancer Profile
          </MenuItem>
          <div>
            {application?.status_id !== OffchainProjectState.Accepted && (

              <MenuItem
                onClick={() => {
                  handleOptionsClose();
                  setOpenPopup(true);
                }}
                className='!text-imbue-purple'
              >
                Hire
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                handleOptionsClose();
                updateApplicationState(
                  application,
                  OffchainProjectState.ChangesRequested
                );
              }}
              className='!text-imbue-purple'
            >
              Request Changes
            </MenuItem>

            {application?.status_id !== OffchainProjectState.Rejected && (

              <MenuItem
                onClick={() => {
                  handleOptionsClose();
                  updateApplicationState(
                    application,
                    OffchainProjectState.Rejected
                  );
                }}
                className='!text-imbue-purple'
              >
                Reject
              </MenuItem>
            )}

          </div>
        </Menu>
      </div>

      <HirePopup
        {...{
          openPopup,
          setOpenPopup,
          brief,
          freelancer,
          application,
          milestones,
          totalCostWithoutFee,
          imbueFee,
          totalCost,
          setLoading,
        }}
      />

      <AccountChoice
        accountSelected={(account: WalletAccount) => accountSelected(account)}
        visible={openAccountChoice}
        setVisible={setOpenAccountChoice}
      />

      <ErrorScreen {...{ error, setError }}>
        <div className='flex flex-col gap-4 w-1/2'>
          <button
            onClick={() => setError(null)}
            className='primary-btn in-dark w-button w-full !m-0'
          >
            Try Again
          </button>
          <button
            onClick={() => router.push(`/dashboard`)}
            className='underline text-xs lg:text-base font-bold'
          >
            Go to Dashboard
          </button>
        </div>
      </ErrorScreen>
    </div>
  );
};

export default BriefOwnerHeader;
