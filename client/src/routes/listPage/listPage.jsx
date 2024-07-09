import "./listPage.scss";
import Filter from "../../components/filter/Filter";
import Card from "../../components/card/Card";
import Map from "../../components/map/Map";
import {Await, Navigate, useLoaderData, useNavigate, useSearchParams} from "react-router-dom";
import {Suspense, useContext, useEffect, useRef, useState} from "react";
import {savedPostStore} from "../../lib/savedPostStore.js";
import {AuthContext} from "../../context/AuthContext.jsx";


function ListPage() {
    const data = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    const {currentUser} = useContext(AuthContext);
    const query = {
        type: searchParams.get("type") || "",
        // city: searchParams.get("city") || "",
        latitude: searchParams.get("latitude") || "",
        longitude: searchParams.get("longitude") || "",
        property: searchParams.get("property") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        bedroom: searchParams.get("bedroom") || "",
    }

    const savedPosts = savedPostStore((state) => state.savedPosts);

    useEffect(() => {
        console.log('savedPosts', savedPosts);
        const getPostList = () => {
            setSearchParams(query);
        }
        if (currentUser) {
            getPostList();
        }
    }, [savedPosts]);


    console.log('postResponse', data.postResponse);
    if (!currentUser) return <Navigate to="/login"/>;

    else {
        return (
            <div className="listPage">
                <div className="listContainer">
                    <div className="wrapper">
                        <Filter/>
                        <Suspense fallback={<p>Loading...</p>}>
                            <Await
                                resolve={data.postResponse}
                                errorElement={<p>Error loading posts!</p>}
                            >
                                {(postResponse) =>
                                    postResponse.data.map((post, idx) => (
                                        <Card key={idx} card={post}/>
                                    ))
                                }
                            </Await>
                        </Suspense>
                    </div>
                </div>
                <div className="mapContainer">
                    <Suspense fallback={<p>Loading...</p>}>
                        <Await
                            resolve={data.postResponse}
                            errorElement={<p>Error loading posts!</p>}
                        >
                            {(postResponse) => <Map items={postResponse.data}/>}
                        </Await>
                    </Suspense>
                </div>
            </div>
        );
    }

}

export default ListPage;
