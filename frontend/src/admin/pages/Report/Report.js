import React, { useState, useEffect } from "react";
import "./Report.css";
import Loading from "../../components/loading";
import { useNavigate } from "react-router-dom";

export default function Report() {
    const navigate = useNavigate()

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const years = [2023, 2024, 2025, 2026];
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedDay, setSelectedDay] = useState(currentDay);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [summary, setSummary] = useState({ total: 0 });
    const [error, setError] = useState("");

    const getDaysInMonth = (year, month) => {
        return new Date(year, month, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handleYearChange = (newYear) => {
        const year = Number(newYear);
        setSelectedYear(year);
        
        const maxDay = getDaysInMonth(year, selectedMonth);
        if (selectedDay > maxDay) {
        setSelectedDay(maxDay);
        }
    };

    const handleMonthChange = (newMonth) => {
        const month = Number(newMonth);
        setSelectedMonth(month);
        
        const maxDay = getDaysInMonth(selectedYear, month);
        if (selectedDay > maxDay) {
        setSelectedDay(maxDay);
        }
    };

    useEffect(() => {
        const dateString = String(selectedDay).padStart(2, "0");
        const monthString = String(selectedMonth).padStart(2, "0");
        const date = `${selectedYear}-${monthString}-${dateString}`;

        setStartDate(date);
        setEndDate(date);
    }, [selectedYear, selectedMonth, selectedDay]);

    const fetchReport = async () => {
        setLoading(true);
        setError("");

        try {
        const res = await fetch(
            `http://localhost:4000/api/booking?startDate=${startDate}&endDate=${endDate}`
        );

        const data = await res.json();
        console.log(data)

        if (!res.ok) throw new Error(data.message || "Lỗi lấy dữ liệu");

            setRevenueData(data.details || []);
            setSummary(data.summary || { total: 0 });

        } catch (err) {
        setError(err.message);
        console.error(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (startDate && endDate) {
        fetchReport();
        }
    }, [startDate, endDate]);

    return (
        <div className="report-container">
        <h2>Báo cáo doanh thu</h2>

        <div className="filters">
            <div className="filter">
            <label>Năm:</label>
            <select 
                value={selectedYear} 
                onChange={(e) => handleYearChange(e.target.value)}
            >
                {years.map((y) => (
                <option key={y} value={y}>{y}</option>
                ))}
            </select>
            </div>

            <div className="filter">
            <label>Tháng:</label>
            <select 
                value={selectedMonth} 
                onChange={(e) => handleMonthChange(e.target.value)}
            >
                {months.map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
                ))}
            </select>
            </div>

            <div className="filter">
            <label>Ngày:</label>
            <select 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(Number(e.target.value))}
            >
                {days.map((d) => (
                <option key={d} value={d}>Ngày {d}</option>
                ))}
            </select>
            </div>
        </div>

        {loading && <p className="loading-text"> <Loading /> </p>}

        <div className="summary-box">
            <h3>
            Tổng doanh thu trong ngày: {summary.total ? summary.total.toLocaleString() : 0} VNĐ
            </h3>
        </div>

        <table className="report-table">
            <thead>
            <tr>
                <th>ngày bán</th>
                <th>Số lượng vé</th>
                <th>Doanh thu đơn hàng</th>
                <th styel={{width: '50px'}}></th>
            </tr>
            </thead>

            <tbody>
            {revenueData.length > 0 ? (
                revenueData.map((item, index) => (
                <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.ticketCount}</td>
                    <td>{item.revenue.toLocaleString()} VNĐ</td>
                    <td>
                        <button onClick={() => {navigate(`/admin/report/${item.bookingIds[0]}`)}}>
                            Chi tiết doanh thu
                        </button>
                    </td>
                </tr>
                ))
            ) : (
                !loading && (
                <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#999'}}>
                    Không có dữ liệu
                    </td>
                </tr>
                )
            )}
            </tbody>
        </table>
        </div>
    );
}