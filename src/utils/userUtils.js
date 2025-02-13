import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../Enliten-Backend/firebase/config';

export const createUserDocument = async (user) => {
    try {
        // First check if user document already exists
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        // If user document exists, return without making changes
        if (userDocSnap.exists()) {
            console.log("User document already exists");
            return;
        }

        // If user doesn't exist, create new document with initial data
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

        await setDoc(doc(db, "users", user.uid), userData);
        console.log("New user document created successfully");
    } catch (error) {
        console.error("Error handling user document:", error);
        throw error;
    }
}; 