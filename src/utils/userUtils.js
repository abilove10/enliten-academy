import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createUserDocument = async (user) => {
    const subjects = {
        "Tamil": 0,
        "English": 0,
        "History": 0,
        "Polity": 0,
        "Economy": 0,
        "Geography": 0,
        "General Science": 0,
        "Current Affairs": 0,
        "Aptitude & Reasoning": 0
    };

    const userData = {
        name: user.displayName || "",
        email: user.email || "",
        phone_number: user.phoneNumber || "",
        total_score: 0,
        accuracy: 0,
        rank: 0,
        assessment_count: 0,
        subject_analysis: subjects,
        register_time: new Date().toISOString()
    };

    try {
        await setDoc(doc(db, "users", user.uid), userData);
        console.log("User document created successfully");
    } catch (error) {
        console.error("Error creating user document:", error);
        throw error;
    }
}; 