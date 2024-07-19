import React, {useCallback, useContext, useEffect, useState} from "react";
import "./navbar.scss";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {AuthContext} from "../../context/AuthContext";
import {useNotificationStore} from "../../lib/notificationStore";
import PlacesAutocomplete, {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import {UserProgressContext} from "../../context/UserProgressContext.jsx";
import {listPostStore} from "../../lib/listPostStore.js";
import {roomOption, typeOption} from "../../routes/newPostPage/newPostPage.jsx";
import MultiRangeSlider from "../slider/MultiRangeSlider.jsx";
import {currencyFormatter} from "../../util/formatting.js";
import Dropdown from "../dropdown/Dropdown.jsx";
import Button from "../../UI/Button.jsx";
import {NavbarContext} from "../../context/NavbarContext.jsx";
import {toast} from "react-toastify";
import {SearchbarContext} from "../../context/SearchbarContext.jsx";


export const MAX_PRICE = 1000000000;
export const MIN_PRICE = 0;

export const MAX_SIZE = 60;
export const MIN_SIZE = 0;

function Navbar({searchOptions = []}) {


    const {scrollTop, changeScrollTop} = useContext(NavbarContext);
    const {currentUser} = useContext(AuthContext);
    const {searchValue, changeSearchValue} = useContext(SearchbarContext);
    const userFetch = useNotificationStore((state) => state.fetch);
    const postFetch = listPostStore((state) => state.fetch);
    const number = useNotificationStore((state) => state.number);
    const navigate = useNavigate();
    const [latitude, setLatitude] = useState(searchValue.latitude);
    const [longitude, setLongitude] = useState(searchValue.longitude);
    const [location, setLocation] = useState(searchValue.location);
    const [notClicked, setNotClicked] = useState(false);
    const [currentClicked, setCurrentClicked] = useState(0);
    const [status, setStatus] = useState("");
    const setIsLoading = listPostStore((state) => state.setIsLoading);
    const setIsFetch = listPostStore((state) => state.setIsFetch);
    const [types, setTypes] = useState(searchValue.payType);
    const [rooms, setRooms] = useState(searchValue.propertyType);
    const [minPrice, setMinPrice] = useState(MIN_PRICE);
    const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
    const [minSize, setMinSize] = useState(MIN_SIZE);
    const [maxSize, setMaxSize] = useState(MAX_SIZE);



    const handleLocationChange = (location) => {
        setStatus("");
        setLocation(location);
        // setSuggestionsVisible(true);
    };

    const handleSelect = (location, placeId, suggestions) => {
        // setSuggestionsVisible(false);
        setLocation(location);
        geocodeByAddress(location)
            .then((results) => getLatLng(results[0]))
            .then((latLng) => {
                setLatitude(latLng.lat);
                setLongitude(latLng.lng);
                setLocation(location);
            })
            .catch((error) => console.error("Error", error));

        if (location) {
            setCurrentClicked(2);
        }
    };

    const onError = (status, clearSuggestions) => {
        setStatus(status === "ZERO_RESULTS" ? '해당 장소를 찾을 수 없습니다.' : status);
        clearSuggestions();
    }

    const searchClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);

        if(!location) {
            toast.error('주소지를 입력해주세요.');
            return;
        }
        if(types.length < 1) {
            toast.error('거래 유형을 선택해주세요.');
            return;
        }

        if(rooms.length < 1) {
            toast.error('매물 종류를 선택해주세요.');
            return;
        }

        changeSearchValue({
            location,
            payType: types,
            propertyType: rooms,
            minPrice,
            maxPrice,
            minSize,
            maxSize
        })

        const sendTypes = types.join('&type=');
        const sendProperties = rooms.join('&property=');

        await postFetch(`type=${sendTypes}&location=${location}&latitude=${latitude}&longitude=${longitude}&property=${sendProperties}&minPrice=${minPrice}&maxPrice=${maxPrice}&minSize=${minSize}&maxSize=${maxSize}`);
        setIsLoading(false);
        setIsFetch(true);
        navigate(`/list?type=${sendTypes}&location=${location}&latitude=${latitude}&longitude=${longitude}&property=${sendProperties}&minPrice=${minPrice}&maxPrice=${maxPrice}&minSize=${minSize}&maxSize=${maxSize}`);
        // navigate(`/list?type=&${sendTypes}&location=${userLocation.address}&latitude=${query.latitude}&longitude=${query.longitude}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`);
    };

    const clickMenu = (number) => {
        setCurrentClicked(number);
        setNotClicked(true);
    };

    const closeDropdown = () => {
        setCurrentClicked(0);
        setNotClicked(false);
    };

    const openTopScrollNav = useCallback(() => {
        changeScrollTop(true);
    }, [scrollTop]);


    useEffect(() => {
        //다시 usestate값 넣어주기
        setTypes(searchValue.payType);
        setRooms(searchValue.propertyType);
        setLocation(searchValue.location);
        setMaxPrice(searchValue.maxPrice);
        setMinPrice(searchValue.minPrice);
        setMaxSize(searchValue.maxSize);
        setMinSize(searchValue.minSize);

    }, [searchValue]);

    if (currentUser) userFetch();

    return (
        <>
            {
                (scrollTop && currentClicked !== 0 ) && <div className="searchClickBackground"></div>

            //밖에 클릭했을 때 기본 nav로 돌아가게[
            }

            <nav className={scrollTop ? "topNav" : "null"}>
                <div className='upperNav'>
                    <div className="logo" onClick={() => navigate('/')}>
                        <span className="material-symbols-outlined">apartment</span>
                        <span className="estate_logo">Estate</span>
                    </div>
                    <div></div>
                    <div className="user">
                        {
                            currentUser ? (
                                <>
                                    <Button onClick={() => navigate("/location")}>포스팅하기</Button>
                                    <Link to="/profile" className="profile">
                                        {number > 0 && <div className="notification">{number}</div>}
                                        <img src={currentUser.avatar || "/noavatar.jpg"} alt="avatar"/>
                                        <span>{currentUser.username}</span>
                                    </Link>
                                </>
                            ) : (

                                <>
                                    <Button outlined onClick={() => navigate("/login")}>로그인</Button>
                                    <Button outlined onClick={() => navigate("/register")}>회원가입</Button>
                                </>
                            )
                        }

                        {/*<div className="menuIcon">*/}
                        {/*    <img*/}
                        {/*        src="/menu.png"*/}
                        {/*        alt=""*/}
                        {/*        onClick={() => setOpen((prev) => !prev)}*/}
                        {/*    />*/}
                        {/*</div>*/}
                        {/*<div className={open ? "menu active" : "menu"}>*/}
                        {/*    <a href="/">메인페이지</a>*/}
                        {/*</div>*/}

                    </div>
                </div>


                <div className={scrollTop ? "bottomNav topNav" : "bottomNav"}>
                    <PlacesAutocomplete
                        value={location}
                        onChange={handleLocationChange}
                        onSelect={handleSelect}
                        onError={onError}
                        searchOptions={{types: searchOptions}}
                    >
                        {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
                            <>
                                <div className={`search ${notClicked ?'notClicked' : null}`} onClick={openTopScrollNav}>
                                    <div className={`location ${currentClicked === 1 && 'clickedMenu'}`}
                                         onClick={() => clickMenu(1)}>
                                        <p className={scrollTop ? null : 'displayNone'}>위치</p>
                                        <input type="text"
                                               {...getInputProps({
                                                   placeholder: searchOptions ? '도시를 검색하세요.' : '주소를 입력하세요.',
                                                   className: 'inputDiv',
                                               })}/>
                                    </div>
                                    <div className={`check-in ${currentClicked === 2 && 'clickedMenu'}`}
                                         onClick={() => clickMenu(2)}>
                                        <p className={scrollTop ? null : 'displayNone'}>유형</p>
                                        <span className="inputDiv">
                                        {
                                            (types.length + rooms.length === 9) ?
                                                '모든 유형' : [...types, ...rooms].map((type) => {
                                                    return <p key={type}>{[...typeOption, ...roomOption].find(option => option.value === type).label}, &nbsp;</p>
                                                })
                                        }
                                    </span>
                                    </div>
                                    <div className={`check-out ${currentClicked === 3 && 'clickedMenu'}`}
                                         onClick={() => clickMenu(3)}>
                                        <p className={scrollTop ? null : 'displayNone'}>가격</p>
                                        <span className="inputDiv">
                                        {currencyFormatter.format(minPrice)}&nbsp;~&nbsp;{(MAX_PRICE === maxPrice) ? '무제한' : currencyFormatter.format(maxPrice)}
                                    </span>
                                    </div>
                                    <div className={`guests ${currentClicked === 4 && 'clickedMenu'}`}
                                         onClick={() => clickMenu(4)}>
                                        <p className={scrollTop ? null : 'displayNone'}>크기</p>
                                        <span className="inputDiv">
                                            {minSize}평&nbsp;~&nbsp;{(MAX_SIZE === maxSize) ? '60평 이상' : `${maxSize}평`}
                                        </span>
                                        <span className="material-symbols-outlined"
                                              onClick={(e) => searchClick(e)}>search</span>
                                    </div>

                                </div>

                                <Location suggestions={suggestions} getSuggestionItemProps={getSuggestionItemProps}
                                          loading={loading} status={status} shown={(currentClicked === 1)}
                                          close={closeDropdown} scrollTop={scrollTop}/>

                                <Category types={types} setTypes={setTypes} rooms={rooms} setRooms={setRooms}
                                          shown={(currentClicked === 2)} close={closeDropdown} scrollTop={scrollTop}/>

                                <Price minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice}
                                       setMaxPrice={setMaxPrice} shown={(currentClicked === 3)} close={closeDropdown}
                                       scrollTop={scrollTop}/>

                                <Size minSize={minSize} setMinSize={setMinSize} maxSize={maxSize}
                                      setMaxSize={setMaxSize}
                                      shown={(currentClicked === 4)} close={closeDropdown} scrollTop={scrollTop}/>
                            </>
                        )}
                    </PlacesAutocomplete>
                </div>
            </nav>
        </>

    );
}

const Location = ({suggestions, getSuggestionItemProps, loading, status, shown, close, scrollTop}) => {

    return (
        <Dropdown
            shown={shown}
            close={close}
            scrollTop={scrollTop}
        >
            <div className='otherSuggestion'>
                <div className="autocomplete-dropdown">
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
                </div>
            </div>
        </Dropdown>

    );

};

const Size = ({minSize, setMinSize, maxSize, setMaxSize, shown, close, scrollTop}) => {

    return (
        <Dropdown
            shown={shown}
            close={close}
            scrollTop={scrollTop}
        >
            <div className='otherSuggestion'>
                <div className="selectBig">
                    <p>방 크기를 설정해주세요.</p>
                    <div className="selectDivSlider">
                        <MultiRangeSlider
                            min={MIN_SIZE}
                            max={MAX_SIZE}
                            minVal={minSize}
                            setMinVal={setMinSize}
                            maxVal={maxSize}
                            setMaxVal={setMaxSize}
                            step={10}
                            text={{left: '10평 미만', right: '60평 이상', middle: '30평대', total: '60평 이상'}}
                            format={(data) => `${data}평`}
                            onChange={({min, max}) => {
                                setMinSize(min);
                                setMaxSize(max);
                            }}
                        />
                    </div>
                </div>
            </div>
        </Dropdown>
    );

};
const Price = ({minPrice, setMinPrice, maxPrice, setMaxPrice, shown, close, scrollTop}) => {



    const stepCondition = (event) => {
        if (event.target.value < 500000000) { //오억
            return 50000000;
        } else {
            return 100000000;
        }
    }
    return (
        <Dropdown
            shown={shown}
            close={close}
            scrollTop={scrollTop}
        >
            <div className='otherSuggestion'>
                <div className="selectBig">
                    <p>금액대를 설정해주세요.</p>
                    <div className="selectDivSlider">
                        <MultiRangeSlider
                            min={MIN_PRICE}
                            max={MAX_PRICE}
                            minVal={minPrice}
                            maxVal={maxPrice}
                            step={50000000}
                            setMinVal={setMinPrice}
                            setMaxVal={setMaxPrice}
                            stepCondition={stepCondition}
                            text={{
                                left: '최소',
                                right: '최대',
                                middle: currencyFormatter.format(1000000000 / 2),
                                total: '무제한'
                            }}
                            format={currencyFormatter.format}
                            onChange={({min, max}) => {
                                setMinPrice(min);
                                setMaxPrice(max);
                            }}
                        />
                    </div>
                </div>
            </div>
        </Dropdown>
    );
};

const Category = ({types, rooms, setTypes, setRooms, shown, close, scrollTop}) => {


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

    return (
        <Dropdown
            shown={shown}
            close={close}
            scrollTop={scrollTop}
        >
            <div className='otherSuggestion'>
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
            </div>
        </Dropdown>);
};

export default Navbar;
