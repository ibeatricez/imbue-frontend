/* eslint-disable unused-imports/no-unused-vars */
import { Badge } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { BiChevronDown, BiRightArrowAlt } from 'react-icons/bi';
import { BsFilter } from 'react-icons/bs';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import {
  DefaultGenerics,
  FormatMessageResponse,
  StreamChat,
} from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';

import { fetchUser, getStreamChat } from '@/utils';

import AreaGrah from '@/components/AreaGraph';
import BriefsView from '@/components/Dashboard/V2/BriefsView';
import FullScreenLoader from '@/components/FullScreenLoader';
import MessageComponent from '@/components/MessageComponent';

import { Freelancer, Project, User } from '@/model';
import { Brief } from '@/model';
import { getAllSavedBriefs } from '@/redux/services/briefService';
import { getFreelancerApplications } from '@/redux/services/freelancerService';
import { setUnreadMessage } from '@/redux/slices/userSlice';
import { RootState } from '@/redux/store/store';

export type DashboardProps = {
  user: User;
  isAuthenticated: boolean;
  myBriefs: Brief;
  myApplicationsResponse: Project[];
};

const Dashboard = (): JSX.Element => {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [client, setClient] = useState<StreamChat>();
  const {
    user,
    loading: loadingUser,
    error: userError,
  } = useSelector((state: RootState) => state.userState);
  const [unreadMessages, setUnreadMsg] = useState<number>(0);
  const [showMessageBox, setShowMessageBox] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [myApplications, _setMyApplications] = useState<Project[]>();
  const [loadingStreamChat, setLoadingStreamChat] = useState<boolean>(true);

  const [messageList, setMessageList] = useState<
    FormatMessageResponse<DefaultGenerics>[] | null
  >();

  const router = useRouter();
  const { briefId } = router.query;

  const [error, setError] = useState<any>(userError);

  const dispatch = useDispatch();

  const handleMessageBoxClick = async (
    user_id: number,
    _freelancer: Freelancer
  ) => {
    if (user_id) {
      setShowMessageBox(true);
      setTargetUser(await fetchUser(user_id));
    } else {
      //TODO: check if user is logged in
      // redirect("login", `/dapp/freelancers/${freelancer?.username}/`);
    }
  };

  const redirectToBriefApplications = (applicationId: string) => {
    router.push(`/briefs/${briefId}/applications/${applicationId}`);
  };

  useEffect(() => {
    const setupStreamChat = async () => {
      try {
        if (!user?.username && !loadingUser) return router.push('/');
        setClient(await getStreamChat());
        _setMyApplications(await getFreelancerApplications(user?.id));
      } catch (error) {
        setError({ message: error });
      } finally {
        setLoadingStreamChat(false);
      }
    };

    setupStreamChat();
  }, [loadingUser, router, user?.id, user?.username]);

  useEffect(() => {
    if (client && user?.username && !loadingStreamChat) {
      client?.connectUser(
        {
          id: String(user.id),
          username: user.username,
          name: user.display_name,
        },
        user.getstream_token
      );
      const getUnreadMessageChannels = async () => {
        const result = await client.getUnreadCount();
        dispatch(setUnreadMessage({ message: result.channels.length }));
      };

      const getChannel = async () => {
        const filter = {
          type: 'messaging',
          members: { $in: [String(user.id)] },
        };
        const sort: any = { last_message_at: -1 };
        const channels = await client.queryChannels(filter, sort, {
          limit: 4,
          watch: true, // this is the default
          state: true,
        });
        const lastMessages: FormatMessageResponse<DefaultGenerics>[] = [];
        channels.map((channel) => {
          lastMessages.push(channel.lastMessage());
        });
        setMessageList(lastMessages);
      };
      getUnreadMessageChannels();
      getChannel();
      client.on((event) => {
        if (event.total_unread_count !== undefined) {
          getChannel();
          dispatch(setUnreadMessage({ message: event.unread_channels }));
          setUnreadMsg(event.total_unread_count);
        }
      });
    }
  }, [client, user?.getstream_token, user?.username, loadingStreamChat]);

  const [applications, setApplciations] = useState<Project[]>([])
  const [savedProjectsCount, setSavedProjectsCnt] = useState<number>(0)

  const completedProjects = applications.filter((app) => app.completed === true)
  const activeProjects = applications.filter((app) => app.completed === false && app.chain_project_id)
  const pendingProjects = applications.filter((app) => app.status_id === 1)

  useEffect(() => {
    const getProjects = async () => {
      const applications = await getFreelancerApplications(user.id);
      const savedBriefs: any = await getAllSavedBriefs(
        0,
        0,
        user?.id
      );

      setApplciations(applications);
      setSavedProjectsCnt(savedBriefs.totalBriefs);
    };

    if (user?.id) getProjects();
  }, [user.id]);

  const options = [
    { name: 'Approved', bg: "bg-[#90DB00]", status_id: 4 },
    { name: 'Pending', bg: "bg-[#FF7A00]", status_id: 1 },
    { name: 'Changes Required', bg: "bg-[#3B27C1]", status_id: 2 },
    { name: 'Rejected', bg: "bg-[#FF7A00]", status_id: 3 },
  ];

  const [selectedOption, setSelectedOption] = useState<typeof options[0]>(options[0]);
  const [openedOption, setOpenedOption] = useState<boolean>(false);
  const [filteredApplications, setFilteredApplications] = useState<Project[]>()

  useEffect(() => {
    const getProjects = async () => {
      // setLoading(true)

      try {
        const Briefs = await getFreelancerApplications(user.id);

        const projectRes = Briefs.filter((item) => item.status_id == selectedOption.status_id);
        setFilteredApplications(projectRes);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      } finally {
        // setLoading(false)
      }
    };

    if (user?.id) getProjects();
  }, [selectedOption.status_id, user.id]);

  if (loadingStreamChat || loadingUser) return <FullScreenLoader />;

  return client ? (
    <div className='bg-white  mt-2 py-7 px-5 rounded-3xl'>
      <>
        <p className='text-black text-[27px]'>
          Welcome , {user.display_name.split(' ')[0]} 👋
        </p>
        <p className='text-text-aux-colour text-sm'>
          Glad to have you on imbue
        </p>
      </>
      {/* starting of the box sections */}
      <div className='flex text-text-grey gap-7 mt-9'>
        <div className=' py-5 px-5 rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full'>
          <div className='flex justify-between'>
            <p>Projects</p>

            <p
              className='bg-imbue-purple px-7 py-2 text-white text-sm rounded-full cursor-pointer'
              onClick={() => router.push('/projects/myprojects')}
            >
              View all
            </p>
          </div>
          <div className='mt-5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1  rounded-full bg-imbue-coral' />
              <p className='text-sm min-w-fit '>Completed Projects</p>
              <hr className='w-full border-dashed mt-3  border-imbue-coral ' />
              <p className='text-[22px] font-semibold text-black'>{completedProjects?.length || 0}</p>
            </div>
          </div>
          <div className='mt-0.5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1 rounded-full bg-imbue-purple' />
              <p className='text-sm min-w-fit '>Active Projects</p>
              <hr className='w-full border-dashed mt-3  border-imbue-purple ' />
              <p className='text-[22px] font-semibold text-black'>{activeProjects?.length || 0}</p>
            </div>
          </div>
          <div className='mt-0.5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1 rounded-full bg-imbue-coral' />
              <p className='text-sm min-w-fit'>Pending Projects</p>
              <hr className='w-full border-dashed mt-3  border-t-imbue-coral ' />
              <p className='text-[22px] font-semibold text-black'>{pendingProjects?.length || 0}</p>
            </div>
          </div>
          <div className='mt-0.5'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1 rounded-full bg-imbue-lemon' />
              <p className='text-sm min-w-fit '>Saved Projects</p>
              <hr className='w-full border-dashed mt-3  border-imbue-lemon ' />
              <p className='text-[22px] font-semibold text-black'>{savedProjectsCount || 0}</p>
            </div>
          </div>
        </div>
        <div className='py-5 px-5 flex flex-col justify-between rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full '>
          <div className='flex justify-between'>
            <p>Briefs</p>
            <div className='relative w-44 select-none'>
              <div
                className='flex bg-white p-2 rounded-md gap-1.5 items-center cursor-pointer'
                onClick={() => setOpenedOption((prev) => !prev)}
              >
                <div className={`${selectedOption.bg} w-1 h-1 rounded-full`} />{' '}
                <p className='text-black text-sm'>{selectedOption.name}</p>
                <BiChevronDown className={`ml-auto ${openedOption && "rotate-180"} `} color='black' size={18} />
              </div>

              <div className={`${!openedOption && "hidden"} bg-white absolute w-full rounded-md`}>
                {
                  options.map((option, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 p-2 cursor-pointer hover:bg-imbue-light-purple'
                      onClick={() => {
                        setSelectedOption(option)
                        setOpenedOption(false)
                      }}
                    >
                      <div className={`${option.bg} w-1 h-1 rounded-full`}></div>
                      <p className='text-sm'>{option.name}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
          <div>
            <div className='mb-2 flex'>
              <p className='text-4xl font-semibold text-black'>{filteredApplications?.length}</p>
              {/* <div className='flex ml-3'>
                <Image
                  className='rounded-full  w-9 h-9 object-cover'
                  src={'/slide_1.png'}
                  width={30}
                  height={20}
                  alt='image'
                />

                <Image
                  className='rounded-full -ml-2 w-9 h-9 object-cover'
                  src={'/slide_2.png'}
                  width={30}
                  height={30}
                  alt='image'
                />
                <Image
                  className='rounded-full -ml-2 w-9 h-9 object-cover'
                  src={'/slide_3.png'}
                  width={30}
                  height={30}
                  alt='image'
                />
              </div> */}
            </div>
            <div className='flex  justify-between'>
              <p>Approved brief</p>
              <div
                className='px-3 py-0.5 border text-black border-text-aux-colour rounded-full cursor-pointer'
                onClick={() => router.push(`/projects/applications?status_id=${selectedOption.status_id}`)}
              >
                <BiRightArrowAlt size={22} className='-rotate-45' />
              </div>
            </div>
          </div>
        </div>
        <div className=' py-5 px-5 flex flex-col rounded-[18px] min-h-[10.625rem] bg-imbue-light-grey  w-full '>
          <div className='flex justify-between'>
            <p>Total Earnings</p>
            <div className='px-3 py-0.5 border text-black border-text-aux-colour rounded-full'>
              <BiRightArrowAlt size={22} className='-rotate-45' />
            </div>
          </div>
          <div className='text-black mt-auto'>
            <div className='flex'>
              <MdOutlineAttachMoney size={23} />
              <p className='text-4xl font-semibold'>32,975.00</p>
            </div>
            <p className='text-text-grey'>Payout Accounts</p>
          </div>
        </div>
      </div>
      {/* ending of the box sections */}
      <div className='mt-9 flex w-full gap-7'>
        <BriefsView
          {...{
            setError,
            currentUser: user
          }}
        />
        <div className='max-w-[25%] w-full rounded-md '>
          {/* Starting of graph */}
          <div className='bg-imbue-light-grey px-0.5 rounded-3xl pb-0.5 '>
            <div className='flex justify-between items-center py-7 px-7'>
              <p className='text-[#747474]'>Analytics</p>
              <BsFilter size={27} color='black' />
            </div>
            <div className='bg-white rounded-3xl relative '>
              <p className='text-black text-4xl font-semibold absolute bottom-28 left-6'>
                124
              </p>
              <AreaGrah />
            </div>
          </div>
          {/* End of graph */}
          <div className='bg-imbue-light-grey px-0.5 mt-14 rounded-3xl pb-0.5 '>
            <div className='flex justify-between items-center py-4 px-7'>
              <Badge badgeContent={unreadMessages} color='error'>
                <p className='text-[#747474]'>Messaging</p>
              </Badge>
              <div
                className='px-3 py-0.5 border text-black border-text-aux-colour rounded-full cursor-pointer'
                onClick={() => router.push('/dashboard/messages')}
              >
                <BiRightArrowAlt size={22} className='-rotate-45' />
              </div>
            </div>
            <div className='px-3 bg-white py-3 rounded-3xl'>
              {messageList?.map((item, index) => (
                <MessageComponent key={'message-component' + index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <p>GETSTREAM_API_KEY not found</p>
  );
};

export default Dashboard;
