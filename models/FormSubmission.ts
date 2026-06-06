import mongoose, { Document, Schema } from 'mongoose';

export interface IFormSubmission extends Document {
    formId: string;               // Identifies which lead form (e.g. "1")
    name: string;
    city: string;
    contactNumber: string;
    email: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    primaryGoal: string;
    medicalConditions: string;
    triedMethods: string;
    dailyRoutine: string;
    preferredDate: string;
    preferredCallTime: string;
    page?: string;
    source?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FormSubmissionSchema = new Schema<IFormSubmission>(
    {
        formId: { type: String, required: true, trim: true, index: true, default: '1' },
        name: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        contactNumber: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        age: { type: String, required: true, trim: true },
        gender: { type: String, required: true, trim: true },
        height: { type: String, required: true, trim: true },
        weight: { type: String, required: true, trim: true },
        primaryGoal: { type: String, required: true, trim: true },
        medicalConditions: { type: String, required: true, trim: true },
        triedMethods: { type: String, required: true, trim: true },
        dailyRoutine: { type: String, required: true, trim: true },
        preferredDate: { type: String, required: true, trim: true },
        preferredCallTime: { type: String, required: true, trim: true },
        page: { type: String, default: 'weight-loss/Leadform/1' },
        source: { type: String, default: 'lead-form' },
    },
    { timestamps: true }
);

// Remove any model cached from a previous schema version so updated fields
// (e.g. preferredDate) are always registered. Mongoose caches models on its
// singleton, which survives Next.js HMR and would otherwise strip new fields.
if (mongoose.models.FormSubmission) {
    delete mongoose.models.FormSubmission;
}

export default mongoose.model<IFormSubmission>('FormSubmission', FormSubmissionSchema);
