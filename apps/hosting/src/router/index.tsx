import React from 'react';
import {Route, Routes} from "react-router-dom";
import Home from "@/pages/Home.tsx";
import Simulator from "@/pages/Simulator.tsx";
import Results from "@/pages/Results.tsx";
import NotFound from "@/pages/NotFound.tsx";

export const Router = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/start" element={<Simulator />} />
            <Route path="/results" element={<Results />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
