import type { TravelCard } from "../../../entities/travel/model/types";
import { useUserProfile } from "../../../entities/user/model/useUserProfile";
import TravelCardBase from "../../../shared/ui/TravelCardBase";

interface TravelCardItemProps {
    travel: TravelCard
    onClick: () => void
}

export default function TravelCardItem({ travel, onClick }: TravelCardItemProps) {
    const author = useUserProfile(travel.userId)

    return (
        <TravelCardBase
            imageUrl={travel.travelImage}
            name={travel.name}
            startDate={travel.startDate}
            endDate={travel.endDate}
            totalBudget={travel.totalBudget}
            authorName={author?.name}
            authorProfileImage={author?.profileImage}
            onClick={onClick}
        />
    )
}