import React, {useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import "./navbar.scss";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {AuthContext} from "../../context/AuthContext";
import {useNotificationStore} from "../../lib/notificationStore";
import Button from "../../UI/Button.jsx";
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import {UserProgressContext} from "../../context/UserProgressContext.jsx";
import {listPostStore} from "../../lib/listPostStore.js";
import {roomOption, typeOption} from "../../routes/newPostPage/newPostPage.jsx";
import MultiRangeSlider from "../slider/MultiRangeSlider.jsx";

function Navbar({scrollTop = null, searchOptions = []}) {


    const [open, setOpen] = useState(false);

    const {currentUser} = useContext(AuthContext);

    const fetch = useNotificationStore((state) => state.fetch);

    const number = useNotificationStore((state) => state.number);

    const navigate = useNavigate();

    const layoutRef = useRef();

    const {clearProgress, saveLocation, location: userLocation} = useContext(UserProgressContext);

    const [location, setLocation] = useState(userLocation.address);

    const [latLng, setLatLng] = useState({
        latitude: null,
        longitude: null
    });

    const [notClicked, setNotClicked] = useState("");


    const [currentClicked, setCurrentClicked] = useState(0);
    const [status, setStatus] = useState("");
    const [suggestionsVisible, setSuggestionsVisible] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const setIsLoading = listPostStore((state) => state.setIsLoading);
    const setIsFetch = listPostStore((state) => state.setIsFetch);
    const [types, setTypes] = useState([]);
    const [rooms, setRooms] = useState([]);

    const [query, setQuery] = useState({
        type: searchParams.get("type") || "",
        latitude: searchParams.get("latitude") || "",
        longitude: searchParams.get("longitude") || "",
        property: searchParams.get("property") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        bedroom: searchParams.get("bedroom") || "",
    });

    const handleLocationChange = (location) => {
        setStatus("");
        setLocation(location);
        setSuggestionsVisible(true);
    };

    const handleSelect = (location, placeId, suggestions) => {
        setSuggestionsVisible(false);
        setLocation(location);
        geocodeByAddress(location)
            .then((results) => getLatLng(results[0]))
            .then((latLng) => {
                searchOptions && saveLocation({...latLng, address: location, city: ''});
                setQuery((prev) => ({...prev, latitude: latLng.lat, longitude: latLng.lng}));

                return setLatLng({latitude: latLng.lat, longitude: latLng.lng});
            })
            .catch((error) => console.error("Error", error));
    };

    const onError = (status, clearSuggestions) => {
        setStatus(status === "ZERO_RESULTS" ? '해당 장소를 찾을 수 없습니다.' : status);
        clearSuggestions();
    }

    const searchClick = async () => {
        setIsLoading(true);
        await fetch(`type=&location=${userLocation.address}&latitude=${userLocation.lat}&longitude=${userLocation.lng}&property=&minPrice=&maxPrice=&bedroom=`);
        setIsLoading(false);
        setIsFetch(true);
        navigate(`/list?type=&${query.type}&location=${userLocation.address}&latitude=${query.latitude}&longitude=${query.longitude}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`);
    };

    const clickMenu = (number) => {
        console.log('asdfasd', number);
        setCurrentClicked(number);
        setNotClicked('notClicked');
    };

    const showMenu = () => {

        let show = null;
        switch (currentClicked) {

            case 1:
                show = <Category types={types} setTypes={setTypes} rooms={rooms} setRooms={setRooms}/>
                break;
            case 2:
                show = <Category types={types} setTypes={setTypes} rooms={rooms} setRooms={setRooms}/>
                break;
            case 3:
                show = <Price/>
                break;
            case 4:
                show = <Category types={types} setTypes={setTypes} rooms={rooms} setRooms={setRooms}/>
                break;

        }

        return show;


    };


    if (currentUser) fetch();

    return (
        <header className={scrollTop}>
            <div className='fix'>
                <div className="logo">로고임</div>
            </div>
            <div>
                <PlacesAutocomplete
                    value={location}
                    onChange={handleLocationChange}
                    onSelect={handleSelect}
                    onError={onError}
                    searchOptions={{types: searchOptions}}
                >
                    {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
                        <div>
                            <div className={`search ${notClicked}`}>
                                <div className={`location ${currentClicked === 1 && 'clickedMenu'}`}
                                     onClick={() => clickMenu(1)}>
                                    <p>위치</p>
                                    <input type="text"
                                           placeholder="Where are you going?"
                                           {...getInputProps({
                                               placeholder: searchOptions ? '도시를 검색하세요.' : '주소를 입력하세요.',
                                               className: 'location-search-input',
                                           })}/>
                                </div>
                                <div className={`check-in ${currentClicked === 2 && 'clickedMenu'}`}
                                     onClick={() => clickMenu(2)}>
                                    <p>유형</p>
                                    <span className="inputDiv">
                                        {
                                            types.map((type) => {
                                                return <p
                                                    key={type}>{typeOption.find(option => option.value === type).label}, &nbsp;</p>
                                            })
                                        }
                                        {
                                            rooms.map((type) => {
                                                return <p
                                                    key={type}>{roomOption.find(option => option.value === type).label}, &nbsp;</p>
                                            })
                                        }
                                    </span>
                                </div>
                                <div className={`check-out ${currentClicked === 3 && 'clickedMenu'}`}
                                     onClick={() => clickMenu(3)}>
                                    <p>가격</p>
                                    <input type="text" placeholder="Add dates"/>
                                </div>
                                <div className={`guests ${currentClicked === 4 && 'clickedMenu'}`}
                                     onClick={() => clickMenu(4)}>
                                    <p>크기</p>
                                    <input type="text" placeholder="Add guests"/>
                                    <span className="material-symbols-outlined" onClick={searchClick}>search</span>
                                </div>
                            </div>
                            {
                                suggestionsVisible && (<div className="autocomplete-dropdown-container">
                                    {loading && <div className="suggestion-item">검색중...</div>}
                                    {status && <div className="suggestion-item">{status}</div>}
                                    {suggestions.map((suggestion) => {
                                        const className = suggestion.active
                                            ? 'suggestion-item--active'
                                            : 'suggestion-item';
                                        return (
                                            <div
                                                key={suggestion.placeId}
                                                {...getSuggestionItemProps(suggestion, {
                                                    className,
                                                })}
                                            >
                                                <span>{suggestion.description}</span>
                                            </div>
                                        );
                                    })}
                                </div>)
                            }
                        </div>
                    )}
                </PlacesAutocomplete>



                {showMenu()}
            </div>
        </header>


    );
}


const Price = () => {


    return (<div className="otherSuggestion">
        <div className="selectBig">
            <p>금액대를 설정해주세요.</p>
            <div className="selectDivSlider">
                <MultiRangeSlider
                    min={0}
                    max={1000000000}
                    step={50000000}
                    onChange={({min, max}) => console.log(`min = ${min}, max = ${max}`)}
                />
            </div>
        </div>

    </div>);

}

const Category = ({types, rooms, setTypes, setRooms}) => {

    const clickTypeOption = (option) => {

        if (types.includes(option.value)) {
            setTypes((prev) => prev.filter((element) => (element != option.value)));
        } else {
            setTypes([...types, option.value]);
        }
    }

    const clickRoomOption = (option) => {

        if (rooms.includes(option.value)) {
            setRooms((prev) => prev.filter((element) => (element != option.value)));
        } else {
            setRooms([...rooms, option.value]);
        }

    }

    return (<div className="otherSuggestion">
        <div className="selectBig">
            <p>거래 유형을 선택하세요.</p>

            <div className="selectDiv">
                {
                    typeOption.map((option) => {
                        return <div key={option.value}
                                    className={`labelDiv ${types.includes(option.value) && 'clicked'}`}
                                    onClick={() => clickTypeOption(option)}>{option.label}</div>
                    })
                }
            </div>
        </div>

        <div className="selectBig">
            <p>매물 종류를 선택하세요.</p>
            <div className="selectDiv">
                {
                    roomOption.map((option) => {
                        return <div key={option.value}
                                    className={`labelDiv ${rooms.includes(option.value) && 'clicked'}`}
                                    onClick={() => clickRoomOption(option)}>{option.label}</div>
                    })
                }
            </div>
        </div>
    </div>);

}
export default Navbar;
