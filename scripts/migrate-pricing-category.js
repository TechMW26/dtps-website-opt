#!/usr/bin/env node

/**
 * Migration script to set category field for existing pricing plans
 * Run this script using: node scripts/migrate-pricing-category.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

// Define the schema inline to avoid import issues
const pricingSchema = new mongoose.Schema({
  planName: String,
  duration: String,
  durationLabel: String,
  price: Number,
  originalPrice: Number,
  currency: String,
  badge: String,
  badgeColor: String,
  features: [{ text: String, included: Boolean }],
  page: {
    type: String,
    enum: ['weight-loss', 'pcod', 'therapeutic', 'wedding']
  },
  category: {
    type: String,
    enum: ['weight-loss', 'pcod', 'new-wedding-plan', 'therapeutic-diet-plans']
  },
  popular: Boolean,
  isActive: Boolean,
  order: Number,
  createdAt: Date,
  updatedAt: Date
});

const Pricing = mongoose.model('Pricing', pricingSchema);

const categoryMapping = {
  'weight-loss': 'weight-loss',
  'pcod': 'pcod',
  'therapeutic': 'therapeutic-diet-plans',
  'wedding': 'new-wedding-plan'
};

async function migrate() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📋 Starting migration...');

    // Update pricing records where category is not set
    const result = await Pricing.updateMany(
      { category: { $exists: false } },
      [
        {
          $set: {
            category: {
              $switch: {
                branches: [
                  { case: { $eq: ['$page', 'weight-loss'] }, then: 'weight-loss' },
                  { case: { $eq: ['$page', 'pcod'] }, then: 'pcod' },
                  { case: { $eq: ['$page', 'therapeutic'] }, then: 'therapeutic-diet-plans' },
                  { case: { $eq: ['$page', 'wedding'] }, then: 'new-wedding-plan' }
                ],
                default: 'weight-loss'
              }
            }
          }
        }
      ]
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Modified: ${result.modifiedCount} records`);
    console.log(`   - Matched: ${result.matchedCount} records`);

    // Show the updated records
    const updatedRecords = await Pricing.find({ category: { $exists: true } }).select('planName page category');
    console.log('\n📊 Updated pricing plans:');
    updatedRecords.forEach(plan => {
      console.log(`   - ${plan.planName} (Page: ${plan.page}, Category: ${plan.category})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Migration finished successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
