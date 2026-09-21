import { User } from 'lucide-react'

interface ProfileAvatarProps {
    imageUrl?: string | null
    size?: number // px 단위, 기본 40
    className?: string
}

export default function ProfileAvatar({ imageUrl, size = 40, className = '' }: ProfileAvatarProps) {
    return (
        <div
            className={`rounded-full bg-pebble/30 overflow-hidden flex items-center justify-center shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            {imageUrl ? (
                <img src={imageUrl} alt="프로필" className="w-full h-full object-cover" />
            ) : (
                <User size={size * 0.5} className="text-cool-ash" />
            )}
        </div>
    )
}