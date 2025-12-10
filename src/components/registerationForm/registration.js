import React, { Component } from "react";

export default class RegistrationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vehicleNumber: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      isMissing: "",
      model: "",
      color: "",
      chassisNumber: "",
      engineNumber: "",
      insuranceExpiry: "",
      registrationDate: "",
      errors: {},
      showSuccess: false,
      totalRegistered: 0
    };
  }

  componentDidMount() {
    this.updateStats();
  }

  updateStats = async () => {
    try {
      const response = await fetch("http://localhost:8000/vehicles");
      if (response.ok) {
        const vehicles = await response.json();
        this.setState({ totalRegistered: vehicles.length });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }

  validateForm = () => {
    const { vehicleNumber, phone, email, chassisNumber } = this.state;
    const newErrors = {};

    // Vehicle number validation (AA11AA1111)
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!vehicleRegex.test(vehicleNumber)) {
      newErrors.vehicleNumber = "Invalid format. Use: AA11AA1111 (e.g., KA01MH1234)";
    }

    // Phone validation
    if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    // Chassis number validation (17 characters)
    if (chassisNumber && chassisNumber.length !== 17) {
      newErrors.chassisNumber = "Chassis number must be 17 characters";
    }

    return newErrors;
  };

  handleRegister = async (event) => {
    event.preventDefault();

    const validationErrors = this.validateForm();
    if (Object.keys(validationErrors).length > 0) {
      this.setState({ errors: validationErrors });
      return;
    }

    const {
      vehicleNumber,
      name,
      phone,
      email,
      address,
      isMissing,
      model,
      color,
      chassisNumber,
      engineNumber,
      insuranceExpiry,
      registrationDate
    } = this.state;

    // Create new vehicle record
    const newVehicle = {
      vehicleNumber,
      name,
      phone,
      email,
      address,
      isMissing,
      model,
      color,
      chassisNumber,
      engineNumber,
      insuranceExpiry,
      registrationDate,
      status: isMissing === "Yes" ? "missing" : "active"
    };

    try {
      const response = await fetch("http://localhost:8000/vehicles/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVehicle),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.setState({
          errors: { vehicleNumber: errorData.detail || "Registration failed" }
        });
        return;
      }

      this.setState({ showSuccess: true });

      // Clear form after 2 seconds
      setTimeout(() => {
        this.setState({
          vehicleNumber: "",
          name: "",
          phone: "",
          email: "",
          address: "",
          isMissing: "",
          model: "",
          color: "",
          chassisNumber: "",
          engineNumber: "",
          insuranceExpiry: "",
          registrationDate: "",
          errors: {},
          showSuccess: false
        });
        this.updateStats();
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error);
      this.setState({
        errors: { vehicleNumber: "Network error. Please try again." }
      });
    }
  };

  handleChange = (field) => (e) => {
    const value = e.target.value;
    this.setState({
      [field]:
        field === "vehicleNumber" ||
        field === "chassisNumber" ||
        field === "engineNumber"
          ? value.toUpperCase()
          : value,
      errors: { ...this.state.errors, [field]: "" }
    });
  };

  render() {
    const {
      vehicleNumber,
      name,
      phone,
      email,
      address,
      isMissing,
      model,
      color,
      chassisNumber,
      engineNumber,
      insuranceExpiry,
      registrationDate,
      errors,
      showSuccess,
      totalRegistered
    } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerIcon}>🚗</div>
            <div>
              <h1 style={styles.title}>Vehicle Registration Portal</h1>
              <p style={styles.subtitle}>
                Register your vehicle in the national database
              </p>
            </div>
          </div>

          {/* Stats Banner */}
          <div style={styles.statsBanner}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{totalRegistered}</span>
              <span style={styles.statLabel}>Total Vehicles Registered</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>✓</span>
              <span style={styles.statLabel}>Secure & Verified</span>
            </div>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <div style={styles.successAlert}>
              <span style={styles.alertIcon}>✓</span>
              <span style={styles.alertText}>
                Vehicle registered successfully!
              </span>
            </div>
          )}

          <form onSubmit={this.handleRegister} style={styles.form}>
            {/* Vehicle Details Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span>🚙</span> Vehicle Details
              </h3>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Vehicle Registration Number <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={vehicleNumber}
                  onChange={this.handleChange("vehicleNumber")}
                  placeholder="KA01MH1234"
                  maxLength="10"
                  required
                  style={errors.vehicleNumber ? styles.inputError : styles.input}
                />
                {errors.vehicleNumber && (
                  <span style={styles.errorText}>{errors.vehicleNumber}</span>
                )}
                <small style={styles.hint}>
                  Format: 2 letters + 2 digits + 2 letters + 4 digits
                </small>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Vehicle Model <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={model}
                    onChange={this.handleChange("model")}
                    placeholder="Hyundai Verna"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Color <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={color}
                    onChange={this.handleChange("color")}
                    placeholder="White"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Chassis Number (VIN)</label>
                  <input
                    type="text"
                    name="chassisNumber"
                    value={chassisNumber}
                    onChange={this.handleChange("chassisNumber")}
                    placeholder="17-character VIN"
                    maxLength="17"
                    style={errors.chassisNumber ? styles.inputError : styles.input}
                  />
                  {errors.chassisNumber && (
                    <span style={styles.errorText}>{errors.chassisNumber}</span>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Engine Number</label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={engineNumber}
                    onChange={this.handleChange("engineNumber")}
                    placeholder="Engine number"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Registration Date <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    name="registrationDate"
                    value={registrationDate}
                    onChange={this.handleChange("registrationDate")}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Insurance Expiry Date</label>
                  <input
                    type="date"
                    name="insuranceExpiry"
                    value={insuranceExpiry}
                    onChange={this.handleChange("insuranceExpiry")}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Owner Details Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span>👤</span> Owner Details
              </h3>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Owner Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={this.handleChange("name")}
                  placeholder="Full name"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Mobile Number <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={this.handleChange("phone")}
                    placeholder="10-digit mobile"
                    maxLength="10"
                    required
                    style={errors.phone ? styles.inputError : styles.input}
                  />
                  {errors.phone && (
                    <span style={styles.errorText}>{errors.phone}</span>
                  )}
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={this.handleChange("email")}
                    placeholder="email@example.com"
                    style={errors.email ? styles.inputError : styles.input}
                  />
                  {errors.email && (
                    <span style={styles.errorText}>{errors.email}</span>
                  )}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Address <span style={styles.required}>*</span>
                </label>
                <textarea
                  name="address"
                  value={address}
                  onChange={this.handleChange("address")}
                  placeholder="Complete address with city and pincode"
                  required
                  rows="3"
                  style={styles.textarea}
                />
              </div>
            </div>

            {/* Vehicle Status Section */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>
                <span>⚠️</span> Vehicle Status
              </h3>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Report as Missing/Stolen <span style={styles.required}>*</span>
                </label>
                <select
                  name="isMissing"
                  value={isMissing}
                  onChange={this.handleChange("isMissing")}
                  required
                  style={styles.select}
                >
                  <option value="">Select status</option>
                  <option value="No">No - Vehicle is with owner</option>
                  <option value="Yes">Yes - Report as stolen/missing</option>
                </select>
                {isMissing === "Yes" && (
                  <div style={styles.warningBox}>
                    ⚠️ This vehicle will be marked as MISSING in the database and
                    authorities will be notified.
                  </div>
                )}
              </div>
            </div>

            <button type="submit" style={styles.submitButton}>
              <span style={styles.buttonIcon}>✓</span>
              Register Vehicle
            </button>
          </form>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
    padding: "40px 20px",
    backgroundColor: "#f3f4f6"
  },
  card: {
    width: "100%",
    maxWidth: "900px",
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "2px solid #e5e7eb"
  },
  headerIcon: {
    fontSize: "48px"
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
    fontWeight: "700"
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: "16px",
    color: "#6b7280"
  },
  statsBanner: {
    display: "flex",
    gap: "20px",
    marginBottom: "32px",
    padding: "20px",
    backgroundColor: "#f0f9ff",
    borderRadius: "12px",
    border: "2px solid #bfdbfe"
  },
  statItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1e40af"
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "600"
  },
  successAlert: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#dcfce7",
    border: "2px solid #86efac",
    borderRadius: "10px",
    marginBottom: "24px"
  },
  alertIcon: {
    fontSize: "24px",
    color: "#16a34a",
    fontWeight: "700"
  },
  alertText: {
    fontSize: "16px",
    color: "#166534",
    fontWeight: "600"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "28px"
  },
  section: {
    padding: "24px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb"
  },
  sectionTitle: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "16px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151"
  },
  required: {
    color: "#ef4444"
  },
  input: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    transition: "all 0.3s",
    fontFamily: "inherit"
  },
  inputError: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #ef4444",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "#fee2e2",
    fontFamily: "inherit"
  },
  textarea: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical"
  },
  select: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    cursor: "pointer",
    backgroundColor: "white",
    fontFamily: "inherit"
  },
  hint: {
    fontSize: "13px",
    color: "#6b7280",
    fontStyle: "italic"
  },
  errorText: {
    fontSize: "13px",
    color: "#ef4444",
    fontWeight: "600"
  },
  warningBox: {
    padding: "12px",
    backgroundColor: "#fef3c7",
    border: "2px solid #fbbf24",
    borderRadius: "8px",
    color: "#92400e",
    fontSize: "14px",
    fontWeight: "500",
    marginTop: "8px"
  },
  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "16px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s",
    marginTop: "12px"
  },
  buttonIcon: {
    fontSize: "22px"
  }
};