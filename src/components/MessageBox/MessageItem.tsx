import { Modal } from '@mui/material';
import classNames from 'classnames';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Image from 'next/image';
import { useState } from 'react';
import { DefaultGenerics, FormatMessageResponse } from 'stream-chat';

import { User } from '@/model';

import ImageCurosal from './ImageCurosal';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

export default function MessageItem({
  message,
  user,
  showProfile,
}: {
  user: User;
  showProfile: boolean;
  message: FormatMessageResponse<DefaultGenerics>;
}) {
  const [isModal, setModal] = useState<string | false>(false);
  if (Number(message.user?.id) === user?.id) {
    return (
      <>
        <Modal
          className='flex justify-center items-center'
          open={isModal ? true : false}
          onClose={() => setModal(false)}
        >
          <ImageCurosal
            Images={message.attachments}
            activeSlide={isModal ? isModal : ''}
          />
        </Modal>

        <div
          className={classNames(
            'flex flex-row-reverse items-end gap-2 ',
            showProfile ? ' mt-1 mb-9' : 'my-1'
          )}
        >
          {showProfile && (
            <Image
              className='w-10 mb-5 h-10 rounded-full object-cover'
              src={
                user.profile_photo ||
                require('@/assets/images/profile-image.png')
              }
              width={70}
              height={70}
              alt='profile image'
            />
          )}
          {!showProfile && <div className='w-10 h-10' />}
          <div className='flex w-[70%]  flex-col items-end'>
            {!!message.attachments?.length && (
              <div className='flex gap-1 my-1 flex-wrap'>
                {message.attachments?.map((item: any) =>
                  item.type === 'image/png' || item.type === 'image' ? (
                    <div className='' key={item.image_url}>
                      <Image
                        onClick={() => setModal(item.image_url)}
                        className='w-80 cursor-pointer max-h-36 rounded-md object-cover'
                        src={item.image_url || ''}
                        width={1920}
                        height={1080}
                        alt='attachments'
                      />
                    </div>
                  ) : (
                    <div
                      className='bg-imbue-lime-light text-black px-2 py-1 rounded-full'
                      key={item.image_url}
                    >
                      <a className='underline' href={item.image_url}>
                        {item.name}
                      </a>
                    </div>
                  )
                )}
              </div>
            )}
            {!!message.text?.trim().length && (
              <div className='bg-imbue-lime-light   px-4 py-1.5 rounded-2xl text-right text-black'>
                <p>{message.text}</p>
              </div>
            )}
            {showProfile && (
              <p className='text-[#7C8B9D]'>
                {timeAgo.format(new Date(message.created_at))}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }
  return (
    <div
      className={classNames(
        'flex items-end gap-2 ',
        showProfile ? ' mt-1 mb-9' : 'my-1'
      )}
    >
      <Modal
        className='flex justify-center items-center'
        open={isModal ? true : false}
        onClose={() => setModal(false)}
      >
        <ImageCurosal
          Images={message.attachments}
          activeSlide={isModal ? isModal : ''}
        />
      </Modal>
      {showProfile && (
        <Image
          className='w-10 mb-5 h-10 rounded-full object-cover'
          src={
            message.user?.profile_photo ||
            require('@/assets/images/profile-image.png')
          }
          width={70}
          height={70}
          alt='profile image'
        />
      )}
      {!showProfile && <div className='w-10 h-10' />}
      <div className='flex w-[70%] flex-col items-start'>
        {!!message.attachments?.length && (
          <div className='flex gap-1 my-1 flex-wrap'>
            {message.attachments?.map((item: any) =>
              item.type === 'image/png' || item.type === 'image' ? (
                <div className='' key={item.image_url}>
                  <Image
                    onClick={() => setModal(item.image_url)}
                    className='w-80 cursor-pointer max-h-36 rounded-md object-cover'
                    src={item.image_url || ''}
                    width={1920}
                    height={1080}
                    alt='attachments'
                  />
                </div>
              ) : (
                <div
                  className='bg-imbue-lime-light text-black px-2 py-1 rounded-full'
                  key={item.image_url}
                >
                  <a className='underline' href={item.image_url}>
                    {item.name}
                  </a>
                </div>
              )
            )}
          </div>
        )}
        {!!message.text?.trim().length && (
          <div className='bg-white px-4 py-1.5 rounded-2xl text-right text-black'>
            <p>{message.text}</p>
          </div>
        )}
        {showProfile && (
          <p className='text-[#7C8B9D] ml-2'>
            {timeAgo.format(new Date(message.created_at))}
          </p>
        )}
      </div>
    </div>
  );
}
