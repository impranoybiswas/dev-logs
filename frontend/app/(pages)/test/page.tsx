"use client"
import { Form, Input, Button, Typography, Card } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { generatePDF } from '@/lib/generate-pdf';

interface RegistrationFormData {
    username: string;
    email: string;
    number: string;
    password: string;
    confirmPassword: string;
}


const registrationSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.email("Invalid email address"),
    number: z.string().min(11, "Number must be at least 11 characters").max(11, "Number must be at most 11 characters").regex(/^[0-9]+$/, "Number must be a valid phone number").refine((value) => value.startsWith("01"), "Number must start with 01"),
    password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const RegistrationForm = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: { username: '', email: '', password: '', confirmPassword: '' }
    });

    const onSubmit = (data: RegistrationFormData) => {
        generatePDF(data);
        console.log("Form Submitted:", data);
    };

    return (
        <Card style={{ maxWidth: 400, margin: '50px auto' }}>
            <Typography.Title level={1} className='text-center'>Sign Up</Typography.Title>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

                {/* Username Field */}
                <Form.Item name="username" label="Username" validateStatus={errors.username ? 'error' : ''} help={errors.username?.message}>
                    <Input placeholder="Type something..." />
                </Form.Item>

                {/* Email Field */}
                <Form.Item
                    label="Email"
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="email@example.com" />}
                    />
                </Form.Item>

                {/* Number Field */}
                <Form.Item name="number" label="Number" validateStatus={errors.number ? 'error' : ''} help={errors.number?.message}>
                    <Controller
                        name="number"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="01..." />}
                    />
                </Form.Item>

                {/* Password Field */}
                <Form.Item
                    label="Password"
                    validateStatus={errors.password ? 'error' : ''}
                    help={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => <Input.Password {...field} />}
                    />
                </Form.Item>

                {/* Confirm Password */}
                <Form.Item
                    label="Confirm Password"
                    validateStatus={errors.confirmPassword ? 'error' : ''}
                    help={errors.confirmPassword?.message}
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => <Input.Password {...field} />}
                    />
                </Form.Item>

                <Button type="primary" htmlType="submit" block>
                    Register
                </Button>
            </Form>
        </Card>
    );
};

export default RegistrationForm;