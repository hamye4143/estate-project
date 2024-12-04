import "./profilePage.scss";
import apiRequest from "../../lib/apiRequest";
import {useLoaderData, useNavigate, useSearchParams} from "react-router-dom";
import {useContext, useEffect} from "react";
import {AuthContext} from "../../context/AuthContext";
import {savedPostStore} from "../../lib/savedPostStore.js";
import Button from "../../UI/Button.jsx";
import {googleLogout} from '@react-oauth/google';
import {toast} from "react-toastify";
import {NavbarContext} from "../../context/NavbarContext.jsx";

function ProfilePage() {
  const data = useLoaderData();

  const { updateUser, currentUser } = useContext(AuthContext);
  const {changeScrollTop} = useContext(NavbarContext);

  const navigate = useNavigate();

  const currentSavedPost = savedPostStore((state) => state.currentSavedPost);

  const [searchParams, setSearchParams] = useSearchParams();

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout");
      updateUser(null);

      if(currentUser.externalType == 'google') {
        googleLogout();
      }
      toast.info('로그아웃 되었습니다.');
      // navigate("/login");
    } catch (err) {
      console.log(err);
      toast.error((err).message);
    }
  };

  useEffect(() => {

    setSearchParams();

  }, [currentSavedPost]);


  return (
      <div className="profilePage">
        <div className="details">
          <div className="wrapper">
            <div className="title">
              <h1>사용자 정보</h1>
              <div className="buttonList">
                <Button outlined onClick={() => navigate("/messages")}>메시지</Button>
                <Button outlined onClick={() => navigate("/profile/update")}>프로필 수정</Button>
                <Button outlined onClick={handleLogout}>로그아웃</Button>
              </div>
            </div>
            <div className="info">
              <div className="info-top">
                <p>프로필</p>
              </div>
              <div className="info-bottom">
                <img src={currentUser.avatar || "/noavatar.jpg"} alt="avatar"/>
              </div>
              <div className="info-top">
                <p>사용자이름</p>
              </div>
              <div className="info-bottom">
                {currentUser.username}
              </div>
              <div className="info-top">
                <p>사용자 이메일</p>
              </div>
              <div className="info-bottom">
                {currentUser.email}
              </div>
            </div>

          </div>
        </div>

      </div>
  );
}

export default ProfilePage;
