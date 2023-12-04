import { ListItemIcon, MenuItem } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import defaultProfile from '../../assets/images/profile-image.png';

const MenuItems = ({ user, isFreelancer, setLoginModal, handleClose }: any) => {
  const router = useRouter();

  const linkItems = [
    {
      icon: 'face',
      text: 'Dashboard',
      link: '/dashboard',
      needAuthentication: true,
      duplicate: false,
    },
    {
      icon: 'work',
      text: 'Submit A Brief',
      link: '/briefs/new',
      needAuthentication: true,
      duplicate: true,
    },
    {
      icon: 'account_balance',
      text: 'Submit A Grant',
      link: '/grants/new',
      needAuthentication: true,
      duplicate: true,
    },
    {
      icon: 'search',
      text: 'Discover Briefs',
      link: '/briefs',
      needAuthentication: false,
      duplicate: true,
    },
    {
      icon: 'groups',
      text: 'Discover Freelancers',
      link: `/freelancers`,
      needAuthentication: false,
      duplicate: true,
    },
    {
      icon: 'person',
      text: 'Profile',
      link: `/profile/${user?.username}/`,
      needAuthentication: true,
      duplicate: false,
    },
    {
      icon: isFreelancer ? 'account_circle' : 'group_add',
      text: isFreelancer ? 'Freelancer Profile' : 'Join The Freelancers',
      link: isFreelancer
        ? `/freelancers/${user?.username}/`
        : '/freelancers/new',
      needAuthentication: true,
      duplicate: false,
    },
    {
      icon: 'money',
      text: 'Transfer Funds',
      link: '/relay',
      needAuthentication: true,
      duplicate: false,
    },
    {
      icon: 'logout',
      text: user?.username ? 'Sign Out' : 'Sign In',
      link: user?.username ? '/logout' : '/login',
      needAuthentication: false,
      duplicate: false,
    },
  ];

  const navigateToPage = async (link: string, needAuthentication: boolean) => {
    handleClose();
    if (needAuthentication && !user?.username) {
      setLoginModal(true);
    } else if (link === "/login") {
      setLoginModal(true)
    } else if (link === "/logout") {
      router.push(link);
    }
    else {
      // router.push(link);
    }
  };
  return (
    <>
      <div className='menuItems flex flex-col lg:gap-2'>
        {/* {
          linkItems.map((item, index) => (
            <MenuItem
              className={`${item.duplicate && 'lg:hidden'} ${item.needAuthentication && !user?.username && 'hidden'
                }`}
              key={index}
              onClick={() => navigateToPage(item.link, item.needAuthentication)}
            >
              {
                (item.needAuthentication && !user?.username) ||
                  item.link === '/logout' ||
                  item.link === '/login'
                  ? (
                    <div
                      className='w-full flex items-center'
                    >
                      <ListItemIcon>
                        <i
                          className='material-icons relative top-[4px] text-imbue-purple-dark'
                          aria-hidden='true'
                        >
                          {item?.icon}
                        </i>
                      </ListItemIcon>
                      <p className='text-imbue-purple-dark text-sm lg:text-base'>{item?.text}</p>
                    </div>)
                  : (
                    <Link
                      href={item.link}
                      rel="noopener noreferrer"
                    >
                      <div
                        className='w-full flex items-center'
                      >
                        <ListItemIcon>
                          <i
                            className='material-icons relative top-[4px] text-imbue-purple-dark'
                            aria-hidden='true'
                          >
                            {item?.icon}
                          </i>
                        </ListItemIcon>
                        <p className='text-imbue-purple-dark text-sm lg:text-base'>{item?.text}</p>
                      </div>
                    </Link>)
              }
            </MenuItem>
          ))
        } */}
        <div className='menuItems flex flex-col lg:gap-2 px-4 py-[10px] w-[300px]'>
          <div className='flex gap-3 items-start px-4 pb-5 border-b'>
            <Link
              href={linkItems[5].link}
              rel='noopener noreferrer'
            >
              <Image
                src={user?.profile_photo ?? defaultProfile}
                width={40}
                height={40}
                alt='profile'
                className='w-7 h-7 lg:w-10 lg:h-10 rounded-full cursor-pointer'
                onClick={() => {
                  handleClose()
                  // navigateToPage(linkItems[5].link, user?.id)
                }}
              />
            </Link>

            <Link
              href={linkItems[6].link}
              rel='noopener noreferrer'
            >
              <p>{user?.display_name || "User Name"}</p>
              <p
                className='text-xs text-content hover:underline cursor-pointer'
                onClick={() => {
                  handleClose()
                  // navigateToPage(linkItems[6].link, user?.id)
                }}
              >
                Freelancer Profile
              </p>
            </Link>
          </div>

          {
            user?.id && (
              <Link
                href={'/dashboard'}
                rel='noopener noreferrer'
              >
                <MenuItem
                  className={`px-4 py-2 flex items-center`}
                  onClick={() => navigateToPage(linkItems[0].link, user?.id)}
                >
                  <ListItemIcon>
                    <Image
                      src={require('../../assets/icons/dashboard.png')}
                      alt='dashboard'
                      className='w-[18px] h-[18px]'
                    />
                  </ListItemIcon>
                  <p className='text-imbue-purple-dark text-sm lg:text-base'>Dashboard</p>
                </MenuItem>
              </Link>
            )
          }

          <MenuItem
            className={`px-4`}
            onClick={() => navigateToPage(linkItems[8].link, user?.id)}
          >
            <ListItemIcon>
              <Image
                src={require('../../assets/icons/sign_out.png')}
                alt='dashboard'
                className='w-[18px] h-[18px]'
              />
            </ListItemIcon>
            <p className='text-imbue-coral text-sm lg:text-base'>{linkItems[8].text}</p>
          </MenuItem>
        </div>
      </div>
    </>)
};

export default MenuItems;
