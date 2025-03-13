import React from "react";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-100 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center md:justify-start">
                        <p className="text-sm text-gray-500">
                            &copy; {currentYear}{" "}
                            <a 
                                href="https://compellio.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:text-indigo-800 hover:underline"
                            >
                                Compellio
                            </a>
                            . All rights reserved.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 flex justify-center">
                        <span className="text-sm text-gray-500">
                            Trustchain Explorer v1.0.0
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
