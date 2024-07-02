import "./singlePage.scss";
import Map from "../../components/map/Map";
import { useNavigate, useLoaderData } from "react-router-dom";
import DOMPurify from "dompurify";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../lib/apiRequest";
import {GoogleMap, LoadScript} from "@react-google-maps/api";
import Slider from "../../components/slider/Slider.jsx";
import {options, roomOption, safeOptions, typeOption} from "../newPostPage/newPostPage.jsx";
import Button from "../../UI/Button.jsx";

function SinglePage() {
  const post = useLoaderData();
  const [saved, setSaved] = useState(post.isSaved);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login");
    }
    // AFTER REACT 19 UPDATE TO USEOPTIMISTIK HOOK
    setSaved((prev) => !prev);
    try {
      await apiRequest.post("/users/save", { postId: post.id });
    } catch (err) {
      console.log(err);
      setSaved((prev) => !prev);
    }
  };

  const typeRoomLabel = roomOption.filter((option) => option.value === post.property)[0].label

  const typeOptionLabel = typeOption.filter((option) => option.value === post.type)[0].label

  console.log('post', post);

  return (
      <div className="singlePage">
        <Slider images={post.images}/>
        <div className="contents">
          <div className="leftContents">
            <div className="details">
              <div className="wrapper">
                <div className="info">
                  <div className="title">
                    <div className="post">
                      <h2>{post.title}</h2>
                      <div className="price">{post.price}원</div>
                      <div className="price">{post.maintenance}원</div>
                      <div
                          className="bottom"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(post.postDetail.desc),
                          }}
                      ></div>
                      <div className="address">
                        <img src="/pin.png" alt="pin"/>
                        <span>{post.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="features">
              <div className="wrapper">
                <p className="title">상세정보</p>
                <div className="listVertical">
                  <div className="feature">
                    <img src="/utility.png" alt="utility"/>
                    <div className="featureText">
                      <span>방종류</span>
                      <p>
                        {
                          typeRoomLabel
                        }
                      </p>

                    </div>
                  </div>

                  <div className="feature">
                    <img src="/utility.png" alt="utility"/>
                    <div className="featureText">
                      <span>타입</span>
                      <p>
                        {
                          typeOptionLabel

                        }
                      </p>
                    </div>
                  </div>
                  <div className="feature">
                    <img src="/pet.png" alt="pet"/>
                    <div className="featureText">
                      <span>애완견 입주</span>
                      {post.postDetail.pet === "yes" ? (
                          <p>허용</p>
                      ) : (
                          <p>비허용</p>
                      )}
                    </div>
                  </div>
                  <div className="feature">
                    <img src="/fee.png" alt="fee"/>
                    <div className="featureText">
                      <span>방향</span>
                      <p>{post.postDetail.direction}</p>
                    </div>
                  </div>
                  <div className="feature">
                    <img src="/fee.png" alt="fee"/>
                    <div className="featureText">
                      <span>주차</span>
                      <p>{post.postDetail.parking}</p>
                    </div>
                  </div>
                </div>
                <p className="title">사이즈</p>
                <div className="sizes">
                  <div className="size">
                    <img src="/size.png" alt="size"/>
                    <span>{post.postDetail.size} 평</span>
                  </div>
                  <div className="size">
                    <img src="/bed.png" alt="bed"/>
                    <span>{post.bedroom} 침실</span>
                  </div>
                  <div className="size">
                    <img src="/bath.png" alt="bath"/>
                    <span>{post.bathroom} 화장실</span>
                  </div>
                </div>
                <p className="title">주변 시설</p>
                <div className="listHorizontal">
                  <div className="feature">
                    <img src="/school.png" alt="school"/>
                    <div className="featureText">
                      <span>학교</span>
                      <p>약&nbsp;
                        {post.postDetail.school > 999
                            ? post.postDetail.school / 1000 + "km"
                            : post.postDetail.school + "m"}{" "}
                      </p>
                    </div>
                  </div>
                  <div className="feature">
                    <img src="/pet.png" alt="pet"/>
                    <div className="featureText">
                      <span>대중교통(버스, 지하철)</span>
                      <p>약 {post.postDetail.bus}m</p>
                    </div>
                  </div>
                  <div className="feature">
                    <img src="/fee.png" alt="fee"/>
                    <div className="featureText">
                      <span>편의시설</span>
                      <p>약 {post.postDetail.bus}m</p>
                    </div>
                  </div>
                </div>


                <p className="title">옵션</p>
                <ul className="optionList">
                  {
                    post.postDetail.option.map((option) => {
                      const data = options.filter((op) => op.value === option)[0]
                      return <li key={option}>
                        <div className="item">
                          <div className="imgDiv"><img src={data.img} alt="image"/></div>
                          <div className="labelDiv">{data.label}</div>
                        </div>
                      </li>;
                    })
                  }
                </ul>


                <p className="title">안전/보안 시설</p>
                <ul className="optionList">
                  {
                    post.postDetail.safeOption.map((option) => {
                      const data = safeOptions.filter((op) => op.value === option)[0]
                      return <li key={option}>
                        <div className="item">
                          <div className="imgDiv"><img src={data.img} alt="image"/></div>
                          <div className="labelDiv">{data.label}</div>
                        </div>
                      </li>
                          ;
                    })
                  }
                </ul>


                <p className="title">위치</p>
                <div className="address">
                  <span>{post.address}</span>
                </div>
                <div className="mapContainer">
                  <Map items={[{latitude: post.latitude, longitude: post.longitude, images: []}]}/>
                </div>



              </div>
            </div>
          </div>
          <aside className="rightContents">
            <div className="stickyContent">
              <div className="rightItem">
                <div className="priceItem">

                  <p className="title">
                    {
                      typeOptionLabel
                    }
                    &nbsp;

                    {
                      post.price
                    }
                    /
                    {
                      post.maintenance
                    }
                  </p>

                </div>
                <div className="priceItemMiddle">
                  <p>
                    {
                      typeRoomLabel

                    }
                  </p>
                  <p>
                    {post.postDetail.size}평
                  </p>
                  <p>
                    {post.bedroom}개 / {post.bathroom}개
                  </p>
                  <p>
                    {post.address}
                  </p>

                </div>

                <div className="itemBottom">
                  <p>
                    {post.user.username}
                  </p>

                </div>

                <div className="buttonDiv">
                  {
                      currentUser.id !== post.userId
                      && (
                          <Button className="message" onClick={() => navigate(`/chat?receiver=${post.userId}`)}>
                            메시지
                          </Button>
                      )
                  }
                  <Button
                      outlined
                      onClick={handleSave}
                      style={{
                        backgroundColor: saved ? "#fece51" : "#fff",
                        borderColor: saved ? "#fece51" : "rgb(221, 221, 221)"
                      }}
                  >
                   저장
                  </Button>
                </div>

              </div>
            </div>
          </aside>
        </div>
      </div>
  );
}

export default SinglePage;
