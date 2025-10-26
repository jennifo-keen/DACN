import './Destination.css'
import React, { useEffect, useState } from "react";
import Loading from "../../components/Layout/loading";
import CurrentPage from "../../components/Layout/CurrentPage/currentPage";
import { useNavigate, useLocation } from "react-router-dom";

export default function Destination() {
    const [dest, setDest] = useState([])
    const [loading, setLoading] = useState(false)

    const params = new URLSearchParams(window.location.search);
    const branchName = params.get('branchName');
    const idBranch = params.get("id");

    useEffect(() => {
        const getBranch = async () => {
            setLoading(true)
            try {
                const response = await fetch(`http://localhost:4000/api/branches/${idBranch}`, {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                })

                const data = await response.json()
                if (data.success) {
                    setDest(data[0])
                }
            }
            catch (e) {
                console.log(e.error)
            }
            finally {
                setLoading(false)
            }
        }

        getBranch()
    }, [])

    if (loading) {
        return <Loading />
    }
    return (
        <div>
            <div>
                <CurrentPage current={branchName} />
            </div>
            <div>
                <h1>{dest.branchId}</h1>
            </div>
        </div>
    )
}