"use client";

import React from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { message } from "@/lib/antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

interface LogIn {
  email: string;
  password: string;
}

interface ErrorResponse {
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/profile");
      // keep isChecking true so nothing renders while redirecting
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const loginMutation = useMutation({
    mutationFn: async (values: LogIn) => {
      const response = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        values,
      );
      return response.data;
    },
    onSuccess: (data: { access_token: string }) => {
      localStorage.setItem("token", data.access_token);
      message.success("Login successful!");
      router.push("/profile");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      message.error(error.response?.data?.message || "Login failed");
    },
  });

  const onFinish = (values: LogIn) => {
    loginMutation.mutate(values);
  };

  // Prevent flashing the login form before the redirect fires
  if (isChecking) return null;

  return (
    <div className="page-container">
      <section className="px-5 flex flex-col items-center justify-center p-6 selection:bg-primary/20 h-dvh">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md mt-12 mb-20"
        >
          <Card className="glass premium-card p-6 border-none shadow-2xl! shadow-primary/10">
            <div className="text-center mb-10">
              <Title
                level={2}
                className="m-0! text-4xl! font-black tracking-tighter text-foreground"
              >
                Welcome Back
              </Title>
              <Text className="text-muted-foreground font-medium text-lg">
                Login to your workspace
              </Text>
            </div>

            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              layout="vertical"
              size="large"
              className="space-y-4"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your Email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
                className="mb-6"
              >
                <Input
                  prefix={
                    <UserOutlined className="text-muted-foreground mr-2" />
                  }
                  placeholder="Email Address"
                  className="h-14! rounded-2xl! border-foreground/5! hover:border-primary! focus:border-primary! bg-foreground/5!"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your Password!" },
                ]}
                className="mb-8"
              >
                <Input.Password
                  prefix={
                    <LockOutlined className="text-muted-foreground mr-2" />
                  }
                  placeholder="Password"
                  className="h-14! rounded-2xl! border-foreground/5! hover:border-primary! focus:border-primary! bg-foreground/5!"
                />
              </Form.Item>

              <Form.Item className="mb-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-14! rounded-2xl! bg-primary! hover:bg-primary-hover! border-none font-bold! text-lg! tracking-tight! shadow-xl! shadow-primary/20"
                  loading={loginMutation.isPending}
                >
                  Sign In
                </Button>
              </Form.Item>

              <div className="text-center text-muted-foreground font-medium">
                Don&apos;t have an account?{" "}
                <a
                  href="/auth/register"
                  className="text-primary hover:text-primary-hover transition-colors font-bold ml-1"
                >
                  Register now
                </a>
              </div>
            </Form>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
