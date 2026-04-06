"use client";

import React, { useState } from 'react';

export default function DeveloperSettingsPage() {
    const [logo, setLogo] = useState('');
    const [academyName, setAcademyName] = useState('Zamalek Academy');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Settings saved! (Placeholder)');
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Developer / Global Settings</h1>

            <form onSubmit={handleSave} className="bg-white p-6 shadow rounded-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Academy Name</label>
                    <input
                        type="text"
                        value={academyName}
                        onChange={(e) => setAcademyName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                    <input
                        type="text"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
}
