import { Marker, Popup } from "react-leaflet";
import "./pin.scss";
import {Link, useNavigate} from "react-router-dom";
import {divIcon, Icon} from "leaflet/src/layer/index.js";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {useContext, useEffect, useRef, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircleXmark, faFontAwesome, faHeart} from "@fortawesome/free-solid-svg-icons";
import apiRequest from "../../lib/apiRequest.js";
import {AuthContext} from "../../context/AuthContext.jsx";
import {savedPostStore} from "../../lib/savedPostStore.js";



const settings = {
    dots: true,
    infinite: true,
    speed: 200,
    slidesToShow: 1,
    slidesToScroll: 1,
};



function Pin({item}) {

    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [saved, setSaved] = useState(item.isSaved);
    const save = savedPostStore((state) => state.save);
    const fetch = savedPostStore((state) => state.fetch);
    const popup = useRef();

    console.log('{item.price}',item.price);
    const customMarkerIcon = divIcon({
        html: `<div class=${saved ? "saved-pin" : "marker"}><div>₩${item.price}</div></div>`
    });

    const closePopup = () => {
        popup.current._closeButton.click();
    }
    //좋아요
    const handleSave = async () => {
        if (!currentUser) {
            navigate("/login");
        }
        // AFTER REACT 19 UPDATE TO USEOPTIMISTIK HOOK
        setSaved((prev) => !prev);
        try {
            await save(item.id);// await apiRequest.post("/users/save", { postId: item.id });
            await fetch();

        } catch (err) {
            console.log(err);
            setSaved((prev) => !prev);
        }
    }

    useEffect(() => {
        setSaved(item.isSaved);
    }, [item]);

    if(!item._id?.$oid && !item.id ) {
        return (
            <Marker position={[item.latitude, item.longitude]}></Marker>
        );
    }
    else {
        return (
            <Marker position={[item.latitude, item.longitude]} icon={customMarkerIcon}>
                <Popup className="popup" ref={popup}>
                    <div className="popupContainer">
                        <div className="icons">
                            <div className="icon" onClick={handleSave}>
                                {
                                    saved ? <FontAwesomeIcon icon={faHeart} style={{backgroundColor: 'red'}}/> :
                                        <FontAwesomeIcon icon={faHeart}/>
                                }
                            </div>
                            <div className="icon" onClick={closePopup}>
                                <FontAwesomeIcon icon={faCircleXmark}/>
                            </div>

                        </div>
                        <Slider {...settings} className="slick-slider">
                            {
                                item.images.map((image, index) => {
                                    return <img key={index} src={image} alt="image"/>
                                })
                            }
                        </Slider>

                        <div className="textContainer">
                            <Link to={`/read/${item.id}`}>{item.title}</Link>
                            <span>{item.bedroom} bedroom</span>
                            <b>₩{item.price}</b>
                        </div>
                    </div>
                </Popup>
            </Marker>
        );
    }
}

export default Pin;
