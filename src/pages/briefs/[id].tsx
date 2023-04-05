/* eslint-disable react-hooks/exhaustive-deps */

import { Brief, User } from "@/model";
import { getBrief } from "@/redux/services/briefService";
import { fetchUser, getCurrentUser } from "@/utils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IoMdWallet } from "react-icons/io";
import { FaHandshake } from "react-icons/fa";
import { HiUserGroup } from "react-icons/hi";
import TimeAgo from "javascript-time-ago";
import { ChatBox } from "@/components/Chat";
import en from "javascript-time-ago/locale/en";

TimeAgo.addLocale(en);

const Brief = () => {
  const router = useRouter();
  const [brief, setBrief] = useState<Brief>({
    id: "",
    headline: "",
    industries: [],
    description: "",
    skills: [],
    scope_id: 0,
    scope_level: "",
    duration: "",
    duration_id: 0,
    budget: 0,
    created: new Date(),
    created_by: "",
    experience_level: "",
    experience_id: 0,
    number_of_briefs_submitted: 0,
    user_id: 0,
  });

  const [browsingUser, setBrowsingUser] = useState<User | null>();
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const isOwnerOfBrief = browsingUser && browsingUser.id == brief.user_id;

  const id: any = router?.query?.id || 0;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (id) {
      const briefData: Brief = await getBrief(id);
      setBrief(briefData);
      setup();
    }
  };

  const setup = async () => {
    setBrowsingUser(await getCurrentUser());
    setTargetUser(await fetchUser(brief.user_id));
  };

  const timeAgo = new TimeAgo("en-US");
  const timePosted = timeAgo.format(new Date(brief.created));

  const redirectToApply = () => {
    //  router.push(`/briefs/${brief.id}/apply`);
  };

  const handleMessageBoxClick = async () => {
    if (browsingUser) {
      setShowMessageBox(true);
    } else {
      //    redirect("login", `/briefs/${brief.id}/`);
    }
  };

  const renderChat = (
    <></>
    // <Modal show={showMessageBox} onHide={() => setShowMessageBox(false)}>
    //   <Modal.Body>
    //     {browsingUser && targetUser ? (
    //       <ChatBox user={browsingUser} targetUser={targetUser}></ChatBox>
    //     ) : (
    //       <p>REACT_APP_GETSTREAM_API_KEY not found</p>
    //     )}
    //   </Modal.Body>
    //   <Modal.Footer>
    //     <button
    //       className="primary-button"
    //       onClick={() => setShowMessageBox(false)}
    //     >
    //       Close
    //     </button>
    //   </Modal.Footer>
    // </Modal>
  );

  const BioPanel = (
    <div className="brief-bio">
      <div className="subsection">
        <div className="header">
          <h3>{brief.headline}</h3>
        </div>
        <span className="time_posted">
          Posted {timePosted} by {brief.created_by}
        </span>
      </div>

      {/* TODO: Do we use same styles for both buttons? */}
      <div className="subsection">
        <div className="action-buttons">
          <button
            className="primary-btn in-dark w-button"
            onClick={() => redirectToApply()}
          >
            Apply
          </button>
          {/* TODO: Implement */}
          {/* <button className="primary-btn in-dark w-button">
                        Save
                    </button> */}
        </div>
      </div>
      <div className="subsection">
        <h3>Project Description</h3>
        <p>{brief.description}</p>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Project Category</h3>
        </div>
        <div className="skills">
          {brief.skills?.map((skill, index) => (
            <p className="skill" key={index}>
              {skill.name}
            </p>
          ))}
        </div>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Total Budget</h3>
        </div>
        <span>${Number(brief.budget).toLocaleString()}</span>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Key Skills And Requirements</h3>
        </div>
        <ul>
          {/* TODO: better have a field in brief object? */}
          {/* FIXME: missing {key} */}
          <li>
            Create user interface designs for desktop based applications and
            cloud services for a technical audience.
          </li>
          <li>Develop design prototypes for testing with users.</li>
          <li>
            Work with Product and Engineering to create new products or improve
            existing products based on user research and customer feedback.
          </li>
          <li>
            Conduct usability surveys and research to identify areas of
            improvement for existing products or new product ideas.
          </li>
          <li>
            Collaborate with engineering to ensure designs can be effectively
            implemented in code.
          </li>
        </ul>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Project Scope</h3>
        </div>
        <span>{brief.scope_level}</span>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Experience Level Required</h3>
        </div>
        <span>{brief.experience_level}</span>
      </div>

      <div className="subsection">
        <div className="header">
          <h3>Estimated Length</h3>
        </div>
        <span>{brief.duration}</span>
      </div>
    </div>
  );

  const BioInsights = (
    <div className="brief-insights">
      <div className="subsection">
        <div className="header">
          <h3 className="brief-insight-h3">Brief Insights</h3>
        </div>
      </div>

      <div className="subsection">
        <div className="brief-insights-stat">
          <FaHandshake className="brief-insight-icon" />
          <h3 className="brief-insight-h3">
            {" "}
            <span>{brief.number_of_briefs_submitted}</span> projects posted
          </h3>
        </div>
      </div>

      <div className="subsection">
        <div className="brief-insights-stat">
          <IoMdWallet className="brief-insight-icon" />
          <h3 className="brief-insight-h3">
            Total Spent <span>$250,000</span>
          </h3>
        </div>
      </div>

      <div className="subsection">
        <div className="brief-insights-stat">
          <HiUserGroup className="brief-insight-icon" />
          <h3 className="brief-insight-h3">
            Applications: <span>10-20</span>{" "}
          </h3>
        </div>
      </div>

      <hr className="separator" />

      {!isOwnerOfBrief && (
        <>
          <div className="subsection">
            <div className="meet-hiring-team">
              <h3>Meet the hiring team:</h3>
              <button
                onClick={() => handleMessageBoxClick()}
                className="primary-btn in-dark w-button"
              >
                Message
              </button>
            </div>
          </div>
          {browsingUser && showMessageBox && renderChat}
        </>
      )}
    </div>
  );

  const SimilarProjects = (
    <div className="similar-briefs">
      <h3>Similar projects on Imbue</h3>
      <div className="divider"></div>

      {/* TODO: Need an object for the list of similar projects */}
      {/* FIXME: missing {key} */}
      <div className="similar-brief">
        <div className="similar-brief-details">
          <p>NFT Minting</p>
          <span>
            Hi guys, I have an NFT I would like to design. The NFT has to have a
            picture of......
          </span>
        </div>
        <button className="primary-btn in-dark w-button">View Brief</button>
      </div>

      <div className="similar-brief">
        <div className="similar-brief-details">
          <p>NFT Minting</p>
          <span>
            Hi guys, I have an NFT I would like to design. The NFT has to have a
            picture of......
          </span>
        </div>
        <button className="primary-btn in-dark w-button">View Brief</button>
      </div>

      <div className="similar-brief">
        <div className="similar-brief-details">
          <p>NFT Minting</p>
          <span>
            Hi guys, I have an NFT I would like to design. The NFT has to have a
            picture of......
          </span>
        </div>
        <button className="primary-btn in-dark w-button">View Brief</button>
      </div>
    </div>
  );

  return (
    <div className="brief-details-container">
      <div className="brief-info">
        {BioPanel}
        {BioInsights}
      </div>
      {/* TODO: Implement */}
      {/* {SimilarProjects} */}
    </div>
  );
};

export default Brief;
