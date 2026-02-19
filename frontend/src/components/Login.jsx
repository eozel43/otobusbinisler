import React, { useState } from 'react';

export function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === 'ulasim' && password === 'ulasim') {
            onLogin();
        } else {
            setError('Hatalı kullanıcı adı veya şifre');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 transition-colors duration-300 px-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-8 border border-gray-200 dark:border-slate-800">
                <div className="text-center space-y-6">
                    <div className="flex justify-center flex-col items-center gap-4">
                        <img
                            src="/logo.png"
                            alt="Kütahya Belediyesi Logo"
                            className="h-24 w-auto object-contain drop-shadow-sm"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/150x150?text=Logo";
                            }}
                        />

                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Ulaşım Hizmetleri Müdürlüğü</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ulaşım Analiz Paneli Girişi</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kullanıcı Adı
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 transition-all duration-200 outline-none"
                                placeholder="Kullanıcı adınızı giriniz"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Şifre
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 transition-all duration-200 outline-none"
                                placeholder="********"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        GÜVENLİ GİRİŞ YAP
                    </button>
                </form>

                <div className="pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500">© {new Date().getFullYear()} Kütahya Belediyesi</p>
                </div>
            </div>
        </div>
    );
}
