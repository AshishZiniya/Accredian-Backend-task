const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ashishziniya1234@gmail.com',
        pass: 'Ziniya@123456'
    }
});

// API endpoint to handle form submission
app.post('/api/referral', async (req, res) => {
    const { referrerName, referrerEmail, referrerPhone, refereeName, refereeEmail, refereePhone, refereeAddress, interest } = req.body;

    // Input validation
    if (!referrerName || !referrerEmail || !referrerPhone || !refereeName || !refereeEmail || !refereePhone || !refereeAddress || !interest) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Save referral data to the database
        const referral = await prisma.referral.create({
            data: {
                referrerName,
                referrerEmail,
                referrerPhone,
                refereeName,
                refereeEmail,
                refereePhone,
                refereeAddress,
                interest,
            }
        });

        // Send email notification
        const mailOptions = {
            from: 'ashishziniya1234@gmail.com',
            to: refereeEmail,
            subject: 'You have been referred!',
            text: `Hello ${refereeName},\n\nYou have been referred by ${referrerName}. Here are the details:\nInterest: ${interest}\n\nBest regards,\nYour Company`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Failed to send email' });
            }
            res.status(200).json({ message: 'Referral submitted successfully', referral });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
