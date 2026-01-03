import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Steps, DatePicker, Row, Col } from 'antd';
import {
    UserOutlined,
    CarOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    BgColorsOutlined,
    SafetyCertificateOutlined,
    RocketOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { Step } = Steps;

const RegistrationForm = () => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        setLoading(true);
        console.log('Received values of form: ', values);

        // Map form values to backend schema
        const payload = {
            vehicleNumber: values.vehicleNumber.toUpperCase(),
            name: values.ownerName,
            phone: values.phoneNumber,
            email: values.email,
            model: values.carModel,
            color: values.carColor,
            registrationDate: values.registrationDate.format('YYYY-MM-DD'),
            address: "Bangalore, India", // Default or add field if needed
            status: "active"
        };

        try {
            const response = await fetch('/api/vehicles/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                message.success('Vehicle registered successfully in Database!');
                setCurrentStep(2); // Move to success step
            } else {
                message.error(data.detail || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Network error. Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* Background effects */}
            <div style={styles.orb1}></div>
            <div style={styles.orb2}></div>

            <div style={styles.contentWrapper}>
                <div style={styles.header}>
                    <RocketOutlined style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px', filter: 'drop-shadow(0 0 10px #667eea)' }} />
                    <Title level={2} style={styles.title}>Vehicle Registry</Title>
                    <Text style={styles.subtitle}>Join the Premium Smart Traffic Network</Text>
                </div>

                <div style={styles.stepsContainer}>
                    <Steps current={currentStep} size="small" className="custom-steps">
                        <Step title="Vehicle Info" />
                        <Step title="Owner Info" />
                        <Step title="Complete" />
                    </Steps>
                </div>

                <Card style={styles.card} bordered={false}>
                    {currentStep < 2 && (
                        <Form
                            form={form}
                            name="vehicle_registration"
                            onFinish={onFinish}
                            layout="vertical"
                            size="large"
                            initialValues={{
                                registrationDate: moment()
                            }}
                        >
                            {/* Step 0: Vehicle Details */}
                            <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                                <Row gutter={16}>
                                    <Col span={24}>
                                        <Form.Item
                                            name="vehicleNumber"
                                            rules={[{ required: true, message: 'Vehicle Number is required!' }]}
                                        >
                                            <Input
                                                prefix={<CarOutlined style={styles.icon} />}
                                                placeholder="Registration Number (e.g. KA-05-MQ-1234)"
                                                style={styles.input}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="carModel"
                                            rules={[{ required: true, message: 'Model is required!' }]}
                                        >
                                            <Input
                                                prefix={<CarOutlined style={styles.icon} />}
                                                placeholder="Car Model (e.g. Swift)"
                                                style={styles.input}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="carColor"
                                            rules={[{ required: true, message: 'Color is required!' }]}
                                        >
                                            <Input
                                                prefix={<BgColorsOutlined style={styles.icon} />}
                                                placeholder="Color"
                                                style={styles.input}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item
                                            name="registrationDate"
                                            rules={[{ required: true, message: 'Date is required!' }]}
                                        >
                                            <DatePicker
                                                style={{ width: '100%', ...styles.input }}
                                                placeholder="Registration Date"
                                                suffixIcon={<CalendarOutlined style={styles.icon} />}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Button type="primary" onClick={() => setCurrentStep(1)} block style={styles.button}>
                                    Next: Owner Details
                                </Button>
                            </div>

                            {/* Step 1: Owner Details */}
                            <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                                <Form.Item
                                    name="ownerName"
                                    rules={[{ required: true, message: 'Owner Name is required!' }]}
                                >
                                    <Input
                                        prefix={<UserOutlined style={styles.icon} />}
                                        placeholder="Owner Full Name"
                                        style={styles.input}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Email is required!' },
                                        { type: 'email', message: 'Enter a valid email!' }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined style={styles.icon} />}
                                        placeholder="Email Address"
                                        style={styles.input}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="phoneNumber"
                                    rules={[{ required: true, message: 'Phone Number is required!' }]}
                                >
                                    <Input
                                        prefix={<PhoneOutlined style={styles.icon} />}
                                        placeholder="Phone Number"
                                        style={styles.input}
                                    />
                                </Form.Item>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button style={styles.secondaryButton} onClick={() => setCurrentStep(0)} block>
                                        Back
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={loading} style={styles.button} block>
                                        Submit Registration
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}

                    {currentStep === 2 && (
                        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                            <div style={styles.successIconWrapper}>
                                <SafetyCertificateOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
                            </div>
                            <Title level={3} style={{ color: '#fff', marginBottom: '8px' }}>Registration Complete</Title>
                            <Text style={{ color: '#aaa', display: 'block', marginBottom: '30px' }}>
                                Vehicle <b>{form.getFieldValue('vehicleNumber')}</b> has been added to the Digital Ledger.
                            </Text>

                            <div style={styles.ticket}>
                                <div style={styles.ticketRow}>
                                    <span>Owner</span>
                                    <b>{form.getFieldValue('ownerName')}</b>
                                </div>
                                <div style={styles.ticketRow}>
                                    <span>Model</span>
                                    <b>{form.getFieldValue('carModel')}</b>
                                </div>
                                <div style={{ ...styles.ticketRow, borderBottom: 'none' }}>
                                    <span>Date</span>
                                    <b>{moment(form.getFieldValue('registrationDate')).format('MMM DD, YYYY')}</b>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                style={{ marginTop: '30px', ...styles.button }}
                                onClick={() => {
                                    setCurrentStep(0);
                                    form.resetFields();
                                }}
                            >
                                Register Another Vehicle
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

const styles = {
    container: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
        padding: '20px',
        overflow: 'hidden',
    },
    // Cool background orbs
    orb1: {
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.4) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(40px)',
        zIndex: 0,
    },
    orb2: {
        position: 'absolute',
        bottom: '10%',
        right: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, rgba(0,0,0,0) 70%)',
        filter: 'blur(50px)',
        zIndex: 0,
    },
    contentWrapper: {
        width: '100%',
        maxWidth: '500px',
        zIndex: 1,
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    title: {
        margin: 0,
        color: '#ffffff',
        fontWeight: '800',
        letterSpacing: '1px',
        background: 'linear-gradient(to right, #fff, #a5b4fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        color: '#9ca3af',
        fontSize: '15px',
        fontWeight: '300',
    },
    stepsContainer: {
        marginBottom: '24px',
        padding: '0 10px',
    },
    card: {
        background: 'rgba(20, 20, 35, 0.6)', // Darker, sleeker background
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden'
    },
    input: {
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        borderRadius: '12px',
        height: '50px',
        padding: '10px 16px',
        fontSize: '16px',
        transition: 'all 0.3s ease'
    },
    icon: {
        color: '#818cf8', // Indigo tint
        fontSize: '18px'
    },
    button: {
        height: '50px',
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Vivid Gradient
        border: 'none',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '16px',
        marginTop: '16px',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
        transition: 'transform 0.2s',
    },
    secondaryButton: {
        height: '50px',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '16px',
        marginTop: '16px',
    },
    successIconWrapper: {
        width: '100px',
        height: '100px',
        background: 'rgba(82, 196, 26, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px auto'
    },
    ticket: {
        background: 'rgba(255,255,255,0.03)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px dashed rgba(255,255,255,0.2)',
        marginTop: '20px'
    },
    ticketRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        color: 'rgba(255,255,255,0.8)'
    }
};

// Styles injection
const globalStyle = `
    .custom-steps .ant-steps-item-title { color: rgba(255,255,255,0.7) !important; font-size: 13px; font-weight: 500; }
    .custom-steps .ant-steps-item-active .ant-steps-item-title { color: white !important; font-weight: 700; text-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
    .custom-steps .ant-steps-item-process .ant-steps-item-icon { background: #6366f1; border-color: #6366f1; }
    
    .ant-picker { background: transparent !important; border: none; }
    .ant-picker-input > input { color: #ffffff !important; font-size: 16px; font-weight: 500; }
    .ant-picker-input > input::placeholder { color: rgba(255,255,255,0.6) !important; }
    .ant-picker-suffix { color: #818cf8; }

    /* Input Styling Override */
    .ant-input { 
        color: #ffffff !important; 
        font-weight: 500;
        background: transparent !important; /* Ensure background doesn't override */
    }
    .ant-input::placeholder { 
        color: rgba(255,255,255,0.6) !important; 
        font-weight: 400;
    }

    /* Input Focus Effects */
    .ant-input:focus, .ant-input-focused {
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    
    .ant-form-item-explain-error { color: #ff6b6b; font-size: 12px; margin-top: 4px; }
`;

const styleTag = document.createElement('style');
styleTag.innerHTML = globalStyle;
document.head.appendChild(styleTag);

export default RegistrationForm;
