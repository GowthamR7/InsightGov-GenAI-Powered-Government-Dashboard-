import React, { useState } from 'react';


const API_BASE_URL = 'http://localhost:5175'; 

function PublicFormView({ onFormSubmit }) {
    const [formData, setFormData] = useState({
        fullName: '',
        district: '',
        schemeAppliedFor: '',
        details: ''
    });
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('Submitting...');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/applications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
               
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${errorText}`);
            }

            setMessage('Application submitted successfully!');
            setFormData({ fullName: '', district: '', schemeAppliedFor: '', details: '' });
            
        
            if (onFormSubmit) {
                onFormSubmit();
            }

        } catch (error) {
            console.error('Submission error:', error);
            setMessage('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);

            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Public Application Form</h1>
            <p className="mt-2 text-gray-600">Fill out the details below to apply for a scheme.</p>
            
            <div className="mt-8 max-w-xl">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700">District</label>
                        <input type="text" name="district" id="district" value={formData.district} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="schemeAppliedFor" className="block text-sm font-medium text-gray-700">Scheme Applying For</label>
                        <input type="text" name="schemeAppliedFor" id="schemeAppliedFor" value={formData.schemeAppliedFor} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details</label>
                        <textarea name="details" id="details" rows="4" value={formData.details} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                    {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
                </form>
            </div>
        </div>
    );
}

export default PublicFormView;

