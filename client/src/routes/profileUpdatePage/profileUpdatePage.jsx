import React, {useCallback, useContext, useState} from "react";
import "./profileUpdatePage.scss";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import { useNavigate } from "react-router-dom";
import UploadWidget from "../../components/uploadWidget/UploadWidget";
import Input from "../../UI/Input.jsx";
import DropZone from "../../components/dropZone/DropZone.jsx";
import Button from "../../UI/Button.jsx";
import axios from "axios";
import {cloudinaryUrl} from "../newPostPage/newPostPage.jsx";

function ProfileUpdatePage() {
  const { currentUser, updateUser } = useContext(AuthContext);
  const [error, setError] = useState("");
  // const [avatar, setAvatar] = useState([]);

  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  // const [imageUrl, setImageUrl] = useState("");


  // const imageUpload = useCallback(async () => {
  //   if (files.length > 0) {
  //     files.map(async file => {
  //       const formData = new FormData();
  //       const config = {
  //         header: {
  //           'content-Type': 'multipart/form-data',
  //         }
  //       }
  //       formData.append('file', file);
  //       formData.append('upload_preset', 'estate');
  //
  //       console.log('file', file);
  //
  //
  //       const res = await axios.post(cloudinaryUrl, formData, config);
  //       console.log('res', res);
  //
  //
  //       setImageUrl(res.data.secure_url);
  //
  //       // setImageUrl('https://images.pexels.com/photos/2467285/pexels-photo-2467285.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')
  //
  //     });
  //   }
  // },[imageUrl, files]);

  const handleSubmit =  useCallback(async (e) => {
    e.preventDefault();
    console.log('file이다.', files[0]);
    const formData = new FormData(e.target);

    let imageUrl = "";

    const {username, email, password} = Object.fromEntries(formData);

    try {

      // await imageUpload();
      if (files.length > 0) {
        const formData = new FormData();
        const config = {
          header: {
            'content-Type': 'multipart/form-data',
          }
        }
        formData.append('file', files[0]);
        formData.append('upload_preset', 'estate');


        //이게 늦게 응답 옴
        const res = await axios.post(cloudinaryUrl, formData, config);
        console.log('res', res);

        imageUrl = res.data.secure_url;
        // setImageUrl(res.data.secure_url); //useState으로 하면 빈 값으로 나옴
      }

      console.log('imageUrl', imageUrl);

      const putRes = await apiRequest.put(`/users/${currentUser.id}`, {
        username,
        email,
        password,
        ...(imageUrl && {avatar: imageUrl})
      });

      console.log('putRes', putRes);
      updateUser(putRes.data);
      navigate("/profile");

    } catch (err) {
      console.log(err);
      setError(err.response.data.message);
    }
  },[files, updateUser, currentUser]);

  return (
      <div className="profileUpdatePage">
        <div className="formContainer">
          <form onSubmit={handleSubmit}>
            <h2>프로필 수정</h2>
            <div className="item">
              <Input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={currentUser.username}
                  label="사용자 이름"
                  maxLength="10"
                  minLength="3"
              />
            </div>
            <div className="item">
              <Input
                  disabled
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={currentUser.email}
                  label="이메일"
              />
            </div>

            <div className="item">
              <p>프로필 이미지</p>
              <div className="avatarDiv">
                <img src={files[0]?.preview || currentUser.avatar || "/noavatar.jpg"} alt="avatar" className="avatar"/>
                <DropZone files={files} setFiles={setFiles}/>
              </div>

            </div>
            <div className="item">
              <Input id="password" name="password" type="password" label="비밀번호"/>
            </div>
            <div className="submit">
              <Button>저장</Button>
              {error && <span>error</span>}
            </div>
          </form>
        </div>

      </div>
  );
}

export default ProfileUpdatePage;
