"use client";

import { motion, Variants } from "framer-motion";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuizIcon from "@mui/icons-material/Quiz";
import NextLink from "next/link";

const faqs = [
  {
    question: "What subjects are available on Raga Vachika?",
    answer:
      "We offer a comprehensive range of subjects for grades 5 to 12, including Mathematics, Science (Physics, Chemistry, Biology), English, Social Studies, and Computer Science. We are constantly adding new courses to help you excel in your studies.",
  },
  {
    question: "How do I access the courses after enrolling?",
    answer:
      "Once you enroll in a course, it will be available in your personal dashboard. You can access all the video lessons, practice exercises, and study materials anytime, from any device. Learning is at your fingertips!",
  },
  {
    question: "Are the classes live or pre-recorded?",
    answer:
      "Raga Vachika offers both live interactive classes and pre-recorded video lessons. Live classes allow you to interact with teachers and ask questions in real-time, while recorded sessions provide the flexibility to learn at your own pace.",
  },
  {
    question: "Can I try a class before enrolling in a full course?",
    answer:
      "Yes! We offer free demo classes for many of our courses. This allows you to experience our teaching style and platform features before making a commitment. Look for the 'Book a Free Demo' option on the course pages.",
  },
  {
    question: "How do you help students prepare for exams?",
    answer:
      "Our courses are designed to build a strong foundation and cover the complete school curriculum. We provide chapter-wise tests, mock exams, and revision notes to help students prepare effectively and score better in their exams.",
  },
  {
    question: "Can I ask questions if I have a doubt?",
    answer:
      "Absolutely! During live classes, you can ask questions directly. For recorded lessons, we have a dedicated 'Ask a Doubt' section where our expert educators will resolve your queries promptly.",
  },
];

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 },
  },
};

export default function FAQSection() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      component={motion.section}
      initial="initial"
      whileInView="animate"
      viewport={{ once: false, amount: 0.2 }}
      sx={{
        py: 10,
        bgcolor: isDarkMode ? "#0A1929" : theme.palette.background.default, // Theme-aware background
        color: isDarkMode ? "white" : theme.palette.text.primary, // Theme-aware text
        position: "relative",
      }}
    >
      <Container maxWidth="md">
        <Box component={motion.div} variants={fadeInUp} sx={{ textAlign: "center", mb: 8 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              bgcolor: "rgba(255, 122, 0, 0.1)", // Orange tint
              borderRadius: "50%",
              mb: 2,
            }}
          >
            <QuizIcon sx={{ fontSize: 32, color: "#FF7A00" }} />
          </Box>
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h6" color={isDarkMode ? "grey.400" : "text.secondary"} sx={{ fontWeight: "normal" }}>
            Everything you need to know about Raga Vachika
          </Typography>
        </Box>

        <Box component={motion.div} variants={fadeInUp}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                bgcolor: isDarkMode ? "#102A43" : "background.paper",
                color: "text.primary",
                backgroundImage: "none", // Remove default gradient
                boxShadow: "none",
                "&:before": {
                  display: "none", // Remove top border
                },
                "&:not(:last-child)": {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                borderRadius: 2,
                mb: 1.5,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: "#FF7A00" }} />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                sx={{
                  "& .MuiAccordionSummary-content": {
                    margin: "16px 0",
                  },
                }}
              >
                <Typography sx={{ fontWeight: "medium", fontSize: "1.1rem" }}>
                  {faq.question}{" "}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box component={motion.div} variants={fadeInUp} sx={{ mt: 8, textAlign: "center" }}>
          <Typography color={isDarkMode ? "grey.400" : "text.secondary"} sx={{ mb: 2 }}>
            Still have questions? Our team is here to help.
          </Typography>
          <Button
            component={NextLink}
            href="/contact"
            variant="outlined"
            sx={{
              color: "#FF7A00",
              borderColor: "rgba(255, 122, 0, 0.5)",
              borderRadius: "50px",
              py: 1,
              px: 4,
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "rgba(255, 122, 0, 0.1)",
                borderColor: "#FF7A00",
              },
            }}
          >
            Contact Support
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
