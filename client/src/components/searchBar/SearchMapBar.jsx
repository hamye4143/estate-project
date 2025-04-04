import PlacesAutocomplete, {geocodeByAddress, geocodeByPlaceId, getLatLng,} from 'react-places-autocomplete';
import React, {useContext, useEffect, useState} from "react";
import {UserProgressContext} from "../../context/UserProgressContext.jsx";
import {useSearchParams} from "react-router-dom";
import "./searchMapBar.scss";


function SearchMapBar({getMapResult, searchOptions=[]}) {
    const {clearProgress, saveLocation, setProgress, progress, location: userLocation, changeDisabled} = useContext(UserProgressContext);
    const [location, setLocation] = useState(userLocation.address);
    const [status, setStatus] = useState("");
    const [suggestionsVisible, setSuggestionsVisible] = useState(true);
    const [latLng, setLatLng] = useState({
        latitude: null,
        longitude: null
    });
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState({
        type: searchParams.getAll("type") || [],
        location: searchParams.get("location") || "",
        political: searchParams.get("political") || "",
        latitude: searchParams.get("latitude") || "",
        longitude: searchParams.get("longitude") || "",
        property: searchParams.getAll("property") || [],
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        minSize: searchParams.get("minSize") || "",
        maxSize: searchParams.get("maxSize") || "",
    });

    const handleLocationChange = (location) => {
        if(location.trim() === "") {
            changeDisabled(true);
        }
        setStatus("");
        setLocation(location);
        setSuggestionsVisible(true);
    };

    const handleSelect = async (location, placeId, suggestions) => {
        const [place] = await geocodeByPlaceId(placeId);

        //political 값만 가져온다.
        const politicalList = place.address_components.filter(c => c.types.includes('political')).map(data => data.long_name);

        setSuggestionsVisible(false);
        setLocation(location);
        geocodeByAddress(location)
            .then((results) => getLatLng(results[0]))
            .then((latLng) => {
                searchOptions && saveLocation({...latLng, address: location, politicalList});
                setQuery((prev) => ({...prev, latitude: latLng.lat, longitude: latLng.lng}));
                changeDisabled(false);
                getMapResult([{latitude: latLng.lat, longitude: latLng.lng, images: [], location}]);
                return setLatLng({latitude: latLng.lat, longitude: latLng.lng});
            })
            .catch((error) => console.error("Error", error));
    };

    const onError = (status, clearSuggestions) => {
        setStatus( status === "ZERO_RESULTS" ? '해당 장소를 찾을 수 없습니다.' : status);
        clearSuggestions();
    }

    const onChange = () => {


    }

    useEffect(() => {
        clearProgress(); // clean-up함수에다 넣기
        setLocation('');
    }, []);

    return (
        <div className="main">
            <div className="map-search">
                <PlacesAutocomplete
                    value={location}
                    onChange={handleLocationChange}
                    onSelect={handleSelect}
                    onError={onError}
                    searchOptions={{types: searchOptions}}
                >
                    {({getInputProps, suggestions, getSuggestionItemProps, loading}) => (
                        <div className="map-content">
                            <div className="map-item">
                                <input
                                    {...getInputProps({
                                        placeholder: searchOptions ? '도시를 검색하세요.' : '주소를 입력하세요.',
                                        className: 'location-search-input',
                                    })}
                                />
                            </div>
                            {
                                suggestionsVisible && (<div className="autocomplete-dropdown-container">
                                    {loading && <div className="suggestion-item">검색중...</div>}
                                    {status && <div className="suggestion-item">{status}</div>}
                                    {suggestions.map((suggestion, index) => {
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
            </div>
        </div>
    );
}

export default SearchMapBar;
