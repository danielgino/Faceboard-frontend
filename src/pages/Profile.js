import Feed from "../components/layout/Feed";
import UserDetails from "../components/profile/UserDetails";
import { useParams } from "react-router-dom";


function Profile() {
    const { userId } = useParams();
    return (
        <div className="flex flex-col lg:flex-row-reverse gap-8 w-full">
            <div className="w-full lg:max-w-sm xl:max-w-md 2xl:max-w-lg">
                <UserDetails otherUserId={userId}/>
            </div>
            <div className="w-full lg:flex-1">
                <Feed userId={userId} className="pointer-events-auto"/>
            </div>
        </div>
    );
}

export default Profile;
