import React, {useContext} from "react";
import apiRequest from "../../lib/apiRequest.js";
import {googleLogout} from "@react-oauth/google";
import {toast} from "react-toastify";
import {AuthContext} from "../../context/AuthContext.jsx";
import {useNavigate} from "react-router-dom";
import "./menuDropdown.scss";
import {SocketContext} from "../../context/SocketContext.jsx";

function MenuDropdown(props) {
    const {isDropdownOpen, closeMenu} = props;
    const {currentUser, updateUser} = useContext(AuthContext);
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);

    const handleLogout = async () => {
        try {

            await apiRequest.post("/auth/logout");
            updateUser(null);

            if (currentUser.externalType == 'google') {
                googleLogout();
            }

            //socket
            // currentUser && socket.emit("logout");

            toast.success('로그아웃 되었습니다.');

        } catch (err) {
            console.log(err);
            toast.error((err).message);
        }
    };

    if(!isDropdownOpen) {
        return null;
    }

    return <div className="modal-wrapper" onClick={closeMenu}>
        <div className={`modal-content`} onClick={e => e.stopPropagation()}>
            <ul>
                <li onClick={() => navigate("/profile")}>프로필</li>
                <li onClick={() => navigate("/messages")}>메시지</li>
                <li onClick={() => navigate("/wish")}>위시리스트</li>
                <li onClick={handleLogout}>로그아웃</li>
            </ul>
        </div>
    </div>;
}

export default MenuDropdown;