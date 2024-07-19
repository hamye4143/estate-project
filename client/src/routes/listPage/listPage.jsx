import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Map from "../../components/map/Map";
import {Navigate, useSearchParams} from "react-router-dom";
import {useContext, useEffect} from "react";
import {savedPostStore} from "../../lib/savedPostStore.js";
import {AuthContext} from "../../context/AuthContext.jsx";
import {listPostStore} from "../../lib/listPostStore.js";
import ListLoading from "../../components/loading/ListLoading.jsx";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import {NavbarContext} from "../../context/NavbarContext.jsx";


function ListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const {currentUser} = useContext(AuthContext);
    const isLoading = listPostStore((state) => state.isLoading);
    const setIsLoading = listPostStore((state) => state.setIsLoading);
    const query = {
        type: searchParams.getAll("type") || "",
        location: searchParams.get("location") || "",
        latitude: searchParams.get("latitude") || "",
        longitude: searchParams.get("longitude") || "",
        property: searchParams.getAll("property") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        minSize: searchParams.get("minSize") || "",
        maxSize: searchParams.get("maxSize") || "",
    }

    const postFetch = listPostStore((state) => state.fetch);
    const posts = listPostStore((state) => state.posts);
    const savedPosts = savedPostStore((state) => state.savedPosts);
    const currentSavedPost = savedPostStore((state) => state.currentSavedPost);
    const {scrollTop, changeScrollTop, changeFixedNavbar} = useContext(NavbarContext);


    useEffect(() => {
        const sendTypes = query.type.join('&type=');
        const sendProperties = query.property.join('&property=');

        if (currentUser && Object.keys(currentSavedPost).length > 0) {
            postFetch(`type=${sendTypes}&location=${query.location}&latitude=${query.latitude}&longitude=${query.longitude}&property=${sendProperties}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}&minSize=${query.minSize}&maxSize=${query.maxSize}`);
        }
    }, [savedPosts]);


    useEffect(() => {
        changeScrollTop(false);
        changeFixedNavbar(true);
        return () => {
            changeFixedNavbar(false);
        };

    }, []);

    if (!currentUser) return <Navigate to="/login"/>;

    else {
        return (
            <div className="listPage">
                <div className="listContainer">
                    <div className="wrapperList">
                        {/*<Filter/>*/}
                        {
                            isLoading ? <ListLoading/> :
                                (posts.length < 1) ? (
                                        <div>
                                            검색결과가 없습니다.
                                        </div>) :
                                    posts.map((post, idx) => (
                                        <Card key={idx} card={post}/>
                                    ))
                        }
                    </div>
                </div>

                <div className="mapContainer">
                    {
                        <Map items={posts}/>
                    }
                </div>
            </div>
        );
    }

}

export default ListPage;
