import React, { useState, useEffect } from "react";
import "./TicketDetail.css";
import Loading from "../../components/Layout/loading";
import { useLocation, useParams } from "react-router-dom";

export default function TicketDetailPage() {
    const [ticketDetail, setTicketDetail] = useState([])
    const [zones, setZones] = useState([])
    const [loading, setLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const params = new URLSearchParams(window.location.search);
    const id_ticket = useParams();

    useEffect (() => {
        const getTicketDetail = async () => {
            setLoading(true)
            try {
                if (!id_ticket) {
                    alert("Không tìm thấy id vé")
                }
                const response = await fetch(`http://localhost:4000/api/ticketDetail/${id_ticket.ticketId}`, {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                })

                const data = await response.json()
                console.log(data.data)
                if (data.success) {
                    setTicketDetail(data.data)
                    setZones(data.data.includedZones)
                }
            }
            catch (e) {
                alert("Lỗi server: ", e.error)
                console.error(e);
            }
            finally {
                setLoading(false)
            }
        }

        getTicketDetail()
    }, [id_ticket])

    if (loading) return <Loading />;

    return (
        <div className="ticket-detail-page">
            <main className="page-main container">
                <div className="ticket-detail-content">
                <h2 className="ticket-title">{ticketDetail.ticketName}</h2>

                {ticketDetail.image_tktypes && ticketDetail.image_tktypes.length > 0 && (
                    <div className="ticket-carousel">
                        <img
                            src="https://anhdulich.vn/storage/images/vinwonders-phu-quoc/a4-toan-canh.jpg"
                            alt="Ticket preview"
                            className="carousel-image"
                        />
                    </div>
                )}

                <section className="section">
                    <h3 className="section-title">BAO GỒM</h3>
                    <ul className="includes-list">
                    {zones.length > 0 ? (
                        zones.map((zone, index) => (
                        <li key={zone._id || index} className="list-item">
                            <span className="bullet green">▸</span> {zone.zoneName || "Khu vực không tên"} <br />
                            <span style={{marginLeft: '50px'}}></span>Giờ hoạt động: {zone.openingTime_zone.slice(11, 16)} AM - {zone.closingTime_zone.slice(11, 16)} PM
                            <br />
                            <span style={{marginLeft: '50px'}}></span> {zone.description_zone} 
                            <br />
                            <span style={{marginLeft: '50px'}}></span> 
                            <img src={zone.image_zone[0]} alt="" />
                        </li>
                        ))
                    ) : (
                        <p>Không có khu vực nào được bao gồm.</p>
                    )}
                    </ul>
                    <p className="description">{ticketDetail.description_ticket}</p>
                </section>

                <div className="price-action">
                    <div className="price-info">
                    <div className="price-main">
                        Chỉ từ{" "}
                        <span className="price-highlight">
                        {ticketDetail.priceChild?.toLocaleString("vi-VN")}đ
                        </span>
                    </div>
                    <div className="price-details">
                        Người lớn:{" "}
                        {ticketDetail.priceAdult?.toLocaleString("vi-VN")}đ | Trẻ em:{" "}
                        {ticketDetail.priceChild?.toLocaleString("vi-VN")}đ
                    </div>
                    </div>
                    <button className="select-btn">Chọn vé</button>
                </div>
                </div>
            </main>
        </div>
    );
}