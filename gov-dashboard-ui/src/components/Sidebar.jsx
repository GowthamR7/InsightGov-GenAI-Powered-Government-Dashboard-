import React from 'react';

function Sidebar({ setView, currentView }) {
    const baseClasses = "flex items-center px-4 py-3 text-gray-200 transition-colors duration-200 transform rounded-lg";
    const activeClasses = "bg-gray-900 text-white";
    const inactiveClasses = "hover:bg-gray-700";

    return (
        <aside className="flex-shrink-0 w-64 bg-gray-800 text-white hidden md:block">
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-20 border-b border-gray-700">
                    <h1 className="text-2xl font-bold">InsightGov</h1>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <a href="dashboard" onClick={() => setView('dashboard')} className={`${baseClasses} ${currentView === 'dashboard' ? activeClasses : inactiveClasses}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        <span className="mx-4 font-medium">Dashboard</span>
                    </a>
                    <a href="create-form" onClick={() => setView('form')} className={`${baseClasses} ${currentView === 'form' ? activeClasses : inactiveClasses}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <span className="mx-4 font-medium">Public Form</span>
                    </a>
                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;

