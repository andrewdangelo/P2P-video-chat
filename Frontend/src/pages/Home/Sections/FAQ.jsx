import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const FAQ = () => (
    <Container maxWidth="md" sx={{ my: 8 }}>
        <Typography variant="h4" fontWeight={600} textAlign="center" gutterBottom>
            Frequently Asked Questions
        </Typography>
        <Box mt={4}>
            {[
                {
                    q: 'Is this really private?',
                    a: 'Yes — calls are direct peer-to-peer using WebRTC, with no media passing through any server.',
                },
                {
                    q: 'Do I need to install anything?',
                    a: 'No installs required. It works entirely in modern browsers.',
                },
                {
                    q: 'How many people can join a call?',
                    a: 'Up to 4 users per call with full-mesh peer connections for performance.',
                },
                {
                    q: 'Is it free to use?',
                    a: 'Yes, this app is completely free with no ads or subscriptions.',
                },
            ].map((item, i) => (
                <Accordion key={i}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography fontWeight={600}>{item.q}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography color="text.secondary">{item.a}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    </Container>
);

export default FAQ;