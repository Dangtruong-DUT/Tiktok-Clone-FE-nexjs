import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { UserVerifyStatus } from '@/constants/enum'
import { cn } from '@/lib/utils'
import { UserType } from '@/types/models/user.model'
import ProfileActionButtons from '@/app/[locale]/(public)/(home)/[username]/_components/profile-action-buttons'
import ProfileRelationsModal from '@/app/[locale]/(public)/(home)/[username]/_components/profile-relations-modal'
import { MdVerified } from 'react-icons/md'
import { getTranslations } from 'next-intl/server'

interface ProfileUserProps {
    userData: UserType
    className?: string
}

async function ProfileUser({ userData, className }: ProfileUserProps) {
    const t = await getTranslations('ProfilePage')
    const {
        uuid,
        username: userUsername,
        name,
        bio,
        avatar,
        verify,
        followers_count,
        following_count,
        likes_count
    } = userData
    return (
        <div className={cn('w-full flex flex-row items-center gap-7 lg:gap-7 max-lg:flex-col max-lg:gap-5', className)}>
            <Avatar className='w-53 h-53 max-md:w-24 max-md:h-24'>
                <AvatarImage src={avatar} alt={userUsername} className='object-cover' />
                <AvatarFallback className='text-2xl font-bold'>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className='w-full flex flex-col items-start gap-3 max-lg:items-center'>
                <div className='flex items-center gap-3'>
                    <h1 className=' font-bold text-2xl leading-6 text-left overflow-hidden text-ellipsis whitespace-nowrap max-w-82'>
                        {name}
                    </h1>

                    {verify === UserVerifyStatus.VERIFIED && <MdVerified size={24} className='text-blue-500' />}

                    <h2 className=' max-w-96 font-semibold text-lg leading-6 text-right overflow-hidden text-ellipsis whitespace-nowrap'>
                        {userUsername}
                    </h2>
                </div>
                <ProfileActionButtons username={userUsername} userId={uuid} />
                <ProfileRelationsModal
                    userUuid={uuid}
                    username={userUsername}
                    followingCount={following_count}
                    followersCount={followers_count}
                    likesCount={likes_count}
                />

                <div className='flex items-center'>
                    <p className='text-left  font-normal text-base leading-5  break-words max-w-96 max-lg:text-center'>
                        {bio || t('bio')}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ProfileUser
