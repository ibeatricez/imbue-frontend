import StarIcon from '@mui/icons-material/Star';
import { Rating } from '@mui/material';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Image from 'next/image';
import {
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlinePlus,
} from 'react-icons/ai';
import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import { TbNorthStar } from 'react-icons/tb';
import { TbUsers } from 'react-icons/tb';
import { TfiEmail } from 'react-icons/tfi';
import { VscVerified } from 'react-icons/vsc';

import { Brief } from '@/model';

TimeAgo.addLocale(en);

const timeAgo = new TimeAgo('en-US');

export default function BriefComponent({ brief }: { brief: Brief }) {
  return (
    <div className='flex border-b'>
      <div className='py-9 px-7 max-w-[70%] w-full'>
        <p className='text-2xl text-imbue-purple-dark'>{brief.headline}</p>
        <div className='flex text-sm text-imbue-dark-coral gap-5 mt-5'>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <TbNorthStar size={18} />
            {brief.experience_level}
          </p>
          <p className='px-3 rounded-xl flex gap-1 items-center py-1 bg-imbue-light-coral '>
            <AiOutlineCalendar size={18} />
            Posted {timeAgo.format(new Date(brief.created))}
          </p>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <AiOutlineClockCircle size={18} />
            {brief.duration}
          </p>
          <p className='px-3 flex items-center gap-1 rounded-xl py-1 bg-imbue-light-coral '>
            <HiOutlineCurrencyDollar size={20} />
            Fixed price
          </p>
        </div>
        <div className='mt-7'>
          <p className='text-black text-sm'>
            {brief.description}
            <span className='text-imbue-purple underline'>more</span>
          </p>
        </div>
        <div className='flex gap-2 mt-5'>
          {brief.skills.map((item, index) => (
            <p
              key={'skills' + index}
              className='text-imbue-purple flex items-center gap-1 bg-imbue-light-purple-three px-4 rounded-full py-1'
            >
              {item.name}
              <AiOutlinePlus color='black' size={18} />
            </p>
          ))}
        </div>
      </div>
      <div className='max-w-[30%] w-full py-7 border-l'>
        <div className='px-7 flex gap-2 pb-4 border-b'>
          <Image
            className='w-9 h-9 rounded-full'
            src='/profile-image.png'
            width={40}
            height={40}
            alt='profile'
          />
          <div>
            <p className='text-black'>{brief.created_by}</p>
            <p className='text-sm'>Company Hire</p>
          </div>
        </div>
        <div className='text-black border-b text-sm py-3 space-y-2 px-9'>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-2'>
              <VscVerified size={20} />
            </span>
            Payment method verified
          </p>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-2 ml-0.5'>
              <TfiEmail size={16} />
            </span>
            {brief.number_of_briefs_submitted}
          </p>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-1.5'>
              <HiOutlineCurrencyDollar size={20} />
            </span>
            $19k total spent
          </p>
          <p className='flex items-center'>
            <span className='text-imbue-purple mr-2'>
              <TbUsers size={18} />
            </span>
            59 hires,6 active
          </p>
        </div>
        <div className='text-xs pt-3 px-7 text-black'>
          <Rating
            className='text-base'
            name='text-feedback'
            value={4.68}
            readOnly
            precision={0.5}
            emptyIcon={
              <StarIcon style={{ opacity: 0.55 }} fontSize='inherit' />
            }
          />
          <div className='flex mt-1 justify-between'>
            <p>4.68 of 40 reviews</p>
            <p>Member since: Aug 17,2023</p>
          </div>
        </div>
      </div>
    </div>
  );
}
