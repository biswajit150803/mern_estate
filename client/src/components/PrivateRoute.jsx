import React from 'react'
import { useSelector } from 'react-redux'
import { Outlet,Navigate } from 'react-router-dom';
export default function PrivateRoute() {
    const {currentUser}=useSelector((state)=>state.user);
//   If the user is logged in, render the Outlet component(profile page), otherwise redirect to the sign-in page.
    return currentUser ? <Outlet /> : <Navigate to="/sign-in" />
}
