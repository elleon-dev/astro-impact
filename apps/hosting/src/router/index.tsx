import React from 'react';
import {Route, Routes} from "react-router-dom";
import Home from "@/pages/home";
import {ResultsPage} from "@/pages/results";
import {SimulatorPage} from "@/pages/simulator";
import {NotFoundPage} from "@/pages/not-found";

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/start" element={<SimulatorPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};
