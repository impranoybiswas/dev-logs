'use client';

import React from 'react';
import { Form, Input, Button, Card, Typography, Select, DatePicker, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, CameraOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface User {
    name: string;
    email: string;
    password: string;
    gender: string;
    birthDate?: Date | string;
    profilePhoto: string;
}

interface ErrorResponse {
    message: string;
}

const { Title, Text } = Typography;
const { Option } = Select;

export default function RegisterPage() {
    const router = useRouter();

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/profile');
        }
    }, [router]);

    const registerMutation = useMutation({
        mutationFn: async (values: User) => {
            // Format date for backend if provided
            if (values.birthDate && typeof values.birthDate !== 'string') {
                values.birthDate = (values.birthDate as { toISOString: () => string }).toISOString();
            }
            const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, values);
            return response.data;
        },
        onSuccess: () => {
            message.success('Registration successful! Please login.');
            router.push('/auth/login');
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            message.error(error.response?.data?.message || 'Registration failed');
        },
    });

    const onFinish = (values: User) => {
        registerMutation.mutate(values);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg my-8">
                <div className="text-center mb-8">
                    <Title level={2}>Create Account</Title>
                    <Text type="secondary">Join Dev Logs today</Text>
                </div>

                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Please input your Name!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Full Name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your Password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item name="gender" label="Gender">
                        <Select placeholder="Select your gender">
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="birthDate" label="Birth Date">
                        <DatePicker className="w-full" />
                    </Form.Item>

                    <Form.Item name="profilePhoto" label="Profile Photo URL">
                        <Input prefix={<CameraOutlined />} placeholder="https://example.com/photo.jpg" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className="w-full"
                            loading={registerMutation.isPending}
                        >
                            Register
                        </Button>
                    </Form.Item>

                    <div className="text-center">
                        Already have an account? <a href="/auth/login">Log in</a>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
