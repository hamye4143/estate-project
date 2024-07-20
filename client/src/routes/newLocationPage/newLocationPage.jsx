import React, {useCallback, useContext, useEffect, useState} from 'react';
import SearchMapBar2 from "../../components/searchBar/SearchMapBar2.jsx";
import "./newLocation.scss";
import Map from "../../components/map/Map.jsx";
import {UserProgressContext} from "../../context/UserProgressContext.jsx";
import Map2 from "../../components/map/Map2.jsx";

function NewLocationPage() {

    const [itemList, setItemList] = useState([]);

    const {setProgress} = useContext(UserProgressContext);

    const getMapResult = useCallback((itemList) => {
        console.log('itemsList', itemList);
        setItemList(itemList);
        setProgress('add');
    }, [itemList]);

    useEffect(() => {
        setProgress('add');
    }, []);

    console.log('itemList', itemList);

    return (
        <div className="locationPage">
            <div><h1>위치는 어디인가요?</h1></div>
            <div>
                <SearchMapBar2 getMapResult={getMapResult}/>
                <div className="mapContainer">
                    <Map2 items={itemList}/>
                </div>
            </div>

        </div>
    );
}

export default NewLocationPage;