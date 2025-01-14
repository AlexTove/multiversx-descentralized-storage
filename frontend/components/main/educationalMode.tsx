// pages/educational-mode.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const EducationalMode: React.FC = () => {
  const [quizStep, setQuizStep] = useState<number>(0);
  const { toast } = useToast();

  const quizQuestions: QuizQuestion[] = [
    {
      question: "What is IPFS?",
      options: [
        "A traditional cloud storage system",
        "A decentralized storage protocol",
        "A type of blockchain",
      ],
      correct: 1,
    },
    {
      question: "What does MultiversX wallet do?",
      options: [
        "Stores files directly",
        "Facilitates decentralized file sharing",
        "Allows you to interact with Web3 apps",
      ],
      correct: 2,
    },
  ];

  const handleQuiz = (selected: number) => {
    if (selected === quizQuestions[quizStep].correct) {
      toast({
        title: "Correct!",
        description: "0x0",
        variant: "default",
      });
    } else {
      toast({
        title: "Wrong!",
        description: "0x0",
        variant: "destructive",
      });
    }
    setQuizStep((prev) => (prev < quizQuestions.length - 1 ? prev + 1 : prev));
  };

  return (
    <section className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold mb-4">Educational Mode</h1>
      <p className="text-lg mb-6">
        Learn about decentralized storage and Web3 technologies.
      </p>

      {/* Animated Explanation */}
      <motion.div
        className="mb-8 p-4 border rounded"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold">What is IPFS?</h2>
        <p>
          IPFS stands for InterPlanetary File System. It’s a protocol designed
          for storing and sharing data in a decentralized way.
        </p>
      </motion.div>

      {/* Quiz Section */}
      <div className="quiz-section">
        {quizStep < quizQuestions.length ? (
          <div>
            <h3 className="text-lg font-bold mb-4">
              {quizQuestions[quizStep].question}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizQuestions[quizStep].options.map((option, index) => (
                <Button
                  key={index}
                  className="btn btn-outline"
                  onClick={() => handleQuiz(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-lg font-semibold">You've completed the quiz!</p>
        )}
      </div>
    </div>
  </section>
  );
};

export default EducationalMode;
