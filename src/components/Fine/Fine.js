import React from "react";
import emailjs from '@emailjs/browser';

export default class Fine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Search fields
      vehicleNumberInput: "",
      vehicleData: null,
      searchError: "",
      isVerified: false,

      // Fine fields
      fineAmount: "",
      fineReason: "",
      fineSent: false,
      emailSending: false,
      emailError: "",
      emailSuccess: false,

      // UI state
      activeTab: "details",
      totalVehicles: 0,
      missingVehicles: 0
    };
  }

  componentDidMount() {
    this.updateStats();
    // Initialize EmailJS with your public key
    emailjs.init("k2dBL5Xibrgd0zTSF");
  }

  updateStats = async () => {
    try {
      const response = await fetch("/api/vehicles");
      if (response.ok) {
        const vehicles = await response.json();
        const missing = vehicles.filter(v => v.status === "missing").length;
        this.setState({
          totalVehicles: vehicles.length,
          missingVehicles: missing
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  showDetails = async () => {
    const vehicleNumber = this.state.vehicleNumberInput.toUpperCase().trim();

    // Validate format (AA11AA1111)
    const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

    if (!regex.test(vehicleNumber)) {
      this.setState({
        searchError: "Invalid format. Use: AA11AA1111 (e.g., KA01MH1234)",
        vehicleData: null,
        isVerified: false
      });
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleNumber}`);

      if (!response.ok) {
        this.setState({
          searchError: "Vehicle not found. Please check the number or register first.",
          vehicleData: null,
          isVerified: false
        });
        return;
      }

      const found = await response.json();

      this.setState({
        vehicleData: found,
        isVerified: true,
        searchError: "",
        fineSent: false,
        emailError: "",
        emailSuccess: false,
        activeTab: "details"
      });
    } catch (error) {
      this.setState({
        searchError: "Network error. Please try again.",
        vehicleData: null,
        isVerified: false
      });
    }
  };

  sendEmailNotification = async (fineDetails) => {
    const { vehicleData } = this.state;

    // Prepare template parameters matching your EmailJS template
    const templateParams = {
      owner_name: vehicleData.name,
      vehicle_number: vehicleData.vehicleNumber,
      vehicle_model: vehicleData.model,
      vehicle_color: vehicleData.color || "N/A",
      fine_amount: fineDetails.amount,
      fine_reason: fineDetails.reason,
      fine_date: new Date(fineDetails.date).toLocaleDateString("en-IN"),
      email: vehicleData.email || "ujjwalbajpai.ec23@rvce.edu.in", // Recipient email
      to_email: vehicleData.email || "ujjwalbajpai.ec23@rvce.edu.in", // Explicit recipient for some templates
      from_name: "FlowGuard Authority", // Sender name
      from_email: "bajpaiujjwal3@gmail.com", // Sender email (if template supports it)
      name: vehicleData.name
    };

    try {
      this.setState({ emailSending: true, emailError: "", emailSuccess: false });

      console.log("Sending email with params:", templateParams);

      const response = await emailjs.send(
        "service_jg2v1lf",           // Your Service ID
        "template_5kykldb",           // Your Template ID
        templateParams,
        "k2dBL5Xibrgd0zTSF"          // Your Public Key
      );

      console.log("Email sent successfully!", response);
      this.setState({
        emailSuccess: true,
        emailSending: false,
        emailError: ""
      });

      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      this.setState({
        emailSending: false,
        emailError: "Failed to send email notification. Fine saved but notification failed. Check console for details.",
        emailSuccess: false
      });
      return false;
    }
  };

  sendFine = async () => {
    const { fineAmount, fineReason, vehicleData } = this.state;

    if (!fineAmount || parseFloat(fineAmount) <= 0) {
      alert("Please enter a valid fine amount!");
      return;
    }

    if (!fineReason.trim()) {
      alert("Please provide a reason for the fine!");
      return;
    }

    // Create fine object
    const newFine = {
      amount: parseFloat(fineAmount),
      reason: fineReason,
      date: new Date().toISOString(),
      status: "pending",
      issuedBy: "Traffic Department"
    };

    try {
      const response = await fetch(`/api/vehicles/${vehicleData.vehicleNumber}/fine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFine),
      });

      if (!response.ok) {
        throw new Error("Failed to issue fine");
      }

      // Refresh vehicle data
      const updatedResponse = await fetch(`/api/vehicles/${vehicleData.vehicleNumber}`);
      const updatedVehicle = await updatedResponse.json();

      // Send email notification
      await this.sendEmailNotification(newFine);

      this.setState({
        fineSent: true,
        fineAmount: "",
        fineReason: "",
        vehicleData: updatedVehicle
      });

      setTimeout(() => {
        this.setState({
          fineSent: false,
          emailSuccess: false,
          emailError: ""
        });
      }, 5000);

    } catch (error) {
      alert("Failed to issue fine: " + error.message);
    }
  };

  reportFound = async () => {
    const { vehicleData } = this.state;
    if (!vehicleData) return;

    try {
      const response = await fetch(`/api/vehicles/${vehicleData.vehicleNumber}/status?status=active&is_missing=No`, {
        method: "PUT"
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      // Refresh vehicle data
      const updatedResponse = await fetch(`/api/vehicles/${vehicleData.vehicleNumber}`);
      const updatedVehicle = await updatedResponse.json();

      this.setState({ vehicleData: updatedVehicle });
      this.updateStats();
      alert("✅ Vehicle status updated to FOUND!");

    } catch (error) {
      alert("Failed to update status: " + error.message);
    }
  };

  calculateTotalFines = () => {
    const { vehicleData } = this.state;
    if (!vehicleData || !vehicleData.fineHistory) return 0;
    return vehicleData.fineHistory
      .filter(f => f.status === "pending")
      .reduce((sum, f) => sum + f.amount, 0);
  };

  handleInputChange = e => {
    this.setState({
      vehicleNumberInput: e.target.value.toUpperCase(),
      searchError: ""
    });
  };

  render() {
    const {
      vehicleNumberInput,
      vehicleData,
      searchError,
      isVerified,
      fineAmount,
      fineReason,

      emailSending,
      emailError,
      emailSuccess,
      activeTab,
      totalVehicles,
      missingVehicles
    } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerIcon}>🔍</div>
            <div>
              <h1 style={styles.title}>Vehicle Search & Fine Management</h1>
              <p style={styles.subtitle}>
                Search vehicles, issue fines, and track missing vehicles
              </p>
            </div>
          </div>

          {/* Stats Banner */}
          <div style={styles.statsBanner}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{totalVehicles}</span>
              <span style={styles.statLabel}>Total Vehicles</span>
            </div>
            <div style={styles.statItem}>
              <span style={{ ...styles.statNumber, color: "#ef4444" }}>
                {missingVehicles}
              </span>
              <span style={styles.statLabel}>Missing Vehicles</span>
            </div>
          </div>

          {/* Search Section */}
          <div style={styles.searchSection}>
            <h3 style={styles.searchTitle}>
              <span>🚗</span> Find Vehicle by License Plate
            </h3>
            <div style={styles.searchBar}>
              <input
                type="text"
                value={vehicleNumberInput}
                onChange={this.handleInputChange}
                placeholder="Enter vehicle number (e.g., KA01MH1234)"
                maxLength="10"
                style={styles.searchInput}
              />
              <button onClick={this.showDetails} style={styles.searchButton}>
                Search
              </button>
            </div>
            <small style={styles.hint}>
              Format: AA11AA1111 (2 letters + 2 digits + 2 letters + 4 digits)
            </small>

            {searchError && (
              <div style={styles.errorAlert}>
                <span>⚠️</span>
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          {isVerified && vehicleData && (
            <div style={styles.detailsContainer}>
              {/* Missing Vehicle Alert */}
              {vehicleData.status === "missing" && (
                <div style={styles.missingBanner}>
                  <div style={styles.missingContent}>
                    <span style={styles.missingIcon}>🚨</span>
                    <div>
                      <strong style={styles.missingTitle}>
                        MISSING VEHICLE ALERT
                      </strong>
                      <p style={styles.missingText}>
                        This vehicle has been reported as stolen/missing
                      </p>
                    </div>
                  </div>
                  <button onClick={this.reportFound} style={styles.foundButton}>
                    Mark as Found
                  </button>
                </div>
              )}

              {/* Tabs */}
              <div style={styles.tabs}>
                <button
                  onClick={() => this.setState({ activeTab: "details" })}
                  style={
                    activeTab === "details" ? styles.activeTab : styles.tab
                  }
                >
                  📋 Vehicle Info
                </button>
                <button
                  onClick={() => this.setState({ activeTab: "fine" })}
                  style={activeTab === "fine" ? styles.activeTab : styles.tab}
                >
                  💰 Issue Fine
                </button>
              </div>

              {/* Details Tab */}
              {activeTab === "details" && (
                <div style={styles.tabContent}>
                  {/* Vehicle Info Grid */}
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Vehicle Information</h3>
                    <div style={styles.infoGrid}>
                      <div style={styles.infoItem}>
                        <label style={styles.infoLabel}>Registration Number</label>
                        <strong style={styles.infoValue}>{vehicleData.vehicleNumber}</strong>
                      </div>
                      <div style={styles.infoItem}>
                        <label style={styles.infoLabel}>Model</label>
                        <strong style={styles.infoValue}>{vehicleData.model}</strong>
                      </div>
                      <div style={styles.infoItem}>
                        <label style={styles.infoLabel}>Color</label>
                        <strong style={styles.infoValue}>{vehicleData.color || "N/A"}</strong>
                      </div>
                      <div style={styles.infoItem}>
                        <label style={styles.infoLabel}>Status</label>
                        <span
                          style={
                            vehicleData.status === "missing"
                              ? styles.statusMissing
                              : styles.statusActive
                          }
                        >
                          {vehicleData.status === "missing" ? "🚨 MISSING" : "✅ Active"}
                        </span>
                      </div>
                      <div style={styles.infoItem}>
                        <label style={styles.infoLabel}>Registration Date</label>
                        <strong style={styles.infoValue}>{vehicleData.registrationDate || "N/A"}</strong>
                      </div>
                      <div style={styles.infoItem}>
                        <label style={styles.infoLabel}>Insurance Expiry</label>
                        <strong style={styles.infoValue}>{vehicleData.insuranceExpiry || "N/A"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Owner Info */}
                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Owner Information</h3>
                    <div style={styles.ownerGrid}>
                      <div style={styles.ownerItem}>
                        <span style={styles.ownerIcon}>👤</span>
                        <div>
                          <label style={styles.infoLabel}>Name</label>
                          <strong style={styles.infoValue}>{vehicleData.name}</strong>
                        </div>
                      </div>
                      <div style={styles.ownerItem}>
                        <span style={styles.ownerIcon}>📱</span>
                        <div>
                          <label style={styles.infoLabel}>Phone</label>
                          <strong style={styles.infoValue}>{vehicleData.phone}</strong>
                        </div>
                      </div>
                      <div style={styles.ownerItem}>
                        <span style={styles.ownerIcon}>📧</span>
                        <div>
                          <label style={styles.infoLabel}>Email</label>
                          <strong style={styles.infoValue}>{vehicleData.email || "N/A"}</strong>
                        </div>
                      </div>
                      <div style={styles.ownerItem}>
                        <span style={styles.ownerIcon}>📍</span>
                        <div>
                          <label style={styles.infoLabel}>Address</label>
                          <strong style={styles.infoValue}>{vehicleData.address}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fine History */}
                  {vehicleData.fineHistory && vehicleData.fineHistory.length > 0 && (
                    <div style={styles.section}>
                      <h3 style={styles.sectionTitle}>
                        Fine History
                        <span style={styles.totalFines}>
                          Total Pending: ₹{this.calculateTotalFines()}
                        </span>
                      </h3>
                      <div style={styles.fineHistory}>
                        {vehicleData.fineHistory.map((fine, idx) => (
                          <div key={idx} style={styles.fineItem}>
                            <div style={styles.fineDetails}>
                              <div style={styles.fineAmount}>₹{fine.amount}</div>
                              <div style={styles.fineReason}>{fine.reason}</div>
                              <div style={styles.fineDate}>
                                📅 {new Date(fine.date).toLocaleDateString("en-IN")} at{" "}
                                {new Date(fine.date).toLocaleTimeString("en-IN")}
                              </div>
                            </div>
                            <span
                              style={
                                fine.status === "pending"
                                  ? styles.pendingBadge
                                  : styles.paidBadge
                              }
                            >
                              {fine.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Fine Tab */}
              {activeTab === "fine" && (
                <div style={styles.tabContent}>
                  {/* Email Notifications */}
                  {emailSending && (
                    <div style={styles.infoAlert}>
                      <div style={styles.spinner}></div>
                      <span>Sending email notification...</span>
                    </div>
                  )}

                  {emailSuccess && (
                    <div style={styles.successAlert}>
                      <span>✅</span>
                      <div>
                        <strong>Fine issued successfully!</strong>
                        <p style={styles.alertSubtext}>Email notification sent to {vehicleData.email || vehicleData.name}</p>
                      </div>
                    </div>
                  )}

                  {emailError && (
                    <div style={styles.warningAlert}>
                      <span>⚠️</span>
                      <div>
                        <strong>Fine saved but email failed</strong>
                        <p style={styles.alertSubtext}>{emailError}</p>
                      </div>
                    </div>
                  )}

                  <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>
                      Issue Traffic Fine
                      <span style={styles.emailInfo}>
                        ✉️ Notification will be sent to: {vehicleData.email || "ujjwalbajpai.ec23@rvce.edu.in"}
                      </span>
                    </h3>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Fine Amount (₹) *</label>
                      <input
                        type="number"
                        value={fineAmount}
                        onChange={e =>
                          this.setState({ fineAmount: e.target.value })
                        }
                        placeholder="Enter amount"
                        min="1"
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Reason for Fine *</label>
                      <textarea
                        value={fineReason}
                        onChange={e =>
                          this.setState({ fineReason: e.target.value })
                        }
                        placeholder="Describe the violation (e.g., Over-speeding at 120km/h in 80km/h zone)"
                        rows="4"
                        style={styles.textarea}
                      />
                    </div>

                    <div style={styles.quickReasons}>
                      <label style={styles.label}>Quick Select Reason:</label>
                      <div style={styles.reasonButtons}>
                        {[
                          { reason: "Over-speeding", amount: 2000 },
                          { reason: "Wrong Parking", amount: 500 },
                          { reason: "No Seatbelt", amount: 1000 },
                          { reason: "Signal Violation", amount: 1000 },
                          { reason: "Mobile Usage while Driving", amount: 1500 },
                          { reason: "Drunk Driving", amount: 10000 }
                        ].map(item => (
                          <button
                            key={item.reason}
                            onClick={() =>
                              this.setState({
                                fineReason: item.reason,
                                fineAmount: item.amount.toString()
                              })
                            }
                            style={styles.reasonButton}
                          >
                            {item.reason}
                            <span style={styles.reasonAmount}>₹{item.amount}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={this.sendFine}
                      style={styles.submitButton}
                      disabled={emailSending}
                    >
                      <span>💰</span>
                      {emailSending ? "Sending..." : "Issue Fine & Send Email"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isVerified && !searchError && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>
              <h3 style={styles.emptyTitle}>Search for a Vehicle</h3>
              <p style={styles.emptyText}>
                Enter a vehicle registration number to view details, check status,
                and manage fines
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    backgroundColor: "#f3f4f6",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: "1000px",
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
  searchSection: {
    marginBottom: "32px",
    padding: "24px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb"
  },
  searchTitle: {
    margin: "0 0 16px 0",
    fontSize: "20px",
    fontWeight: "700",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  searchBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "8px"
  },
  searchInput: {
    flex: 1,
    padding: "14px 18px",
    fontSize: "16px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.3s",
    color: "#111827", // Ensure text is visible
    backgroundColor: "#ffffff" // Ensure background is white
  },
  searchButton: {
    padding: "14px 32px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s"
  },
  hint: {
    fontSize: "13px",
    color: "#6b7280",
    fontStyle: "italic"
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 18px",
    backgroundColor: "#fee2e2",
    border: "2px solid #fca5a5",
    borderRadius: "10px",
    color: "#991b1b",
    marginTop: "16px",
    fontSize: "15px",
    fontWeight: "500"
  },
  successAlert: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 18px",
    backgroundColor: "#dcfce7",
    border: "2px solid #86efac",
    borderRadius: "10px",
    color: "#166534",
    marginBottom: "24px",
    fontSize: "15px"
  },
  warningAlert: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 18px",
    backgroundColor: "#fef3c7",
    border: "2px solid #fcd34d",
    borderRadius: "10px",
    color: "#92400e",
    marginBottom: "24px",
    fontSize: "15px"
  },
  infoAlert: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 18px",
    backgroundColor: "#dbeafe",
    border: "2px solid #93c5fd",
    borderRadius: "10px",
    color: "#1e40af",
    marginBottom: "24px",
    fontSize: "15px",
    fontWeight: "500"
  },
  alertSubtext: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    opacity: 0.9
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid #93c5fd",
    borderTop: "3px solid #1e40af",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },
  detailsContainer: {
    marginTop: "24px"
  },
  missingBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#fee2e2",
    border: "3px solid #ef4444",
    borderRadius: "12px",
    marginBottom: "24px"
  },
  missingContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  missingIcon: {
    fontSize: "36px"
  },
  missingTitle: {
    fontSize: "18px",
    color: "#991b1b",
    display: "block",
    marginBottom: "4px"
  },
  missingText: {
    fontSize: "14px",
    color: "#991b1b",
    margin: 0
  },
  foundButton: {
    padding: "12px 24px",
    backgroundColor: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    borderBottom: "2px solid #e5e7eb"
  },
  tab: {
    padding: "14px 28px",
    backgroundColor: "transparent",
    color: "#6b7280",
    border: "none",
    borderBottom: "3px solid transparent",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s"
  },
  activeTab: {
    padding: "14px 28px",
    backgroundColor: "transparent",
    color: "#4f46e5",
    border: "none",
    borderBottom: "3px solid #4f46e5",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600"
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  section: {
    padding: "24px",
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb"
  },
  sectionTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#374151",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px"
  },
  emailInfo: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: "500",
    backgroundColor: "#e0e7ff",
    padding: "6px 12px",
    borderRadius: "6px"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px"
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },
  infoLabel: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  infoValue: {
    fontSize: "15px",
    color: "#111827",
    fontWeight: "600"
  },
  ownerGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  ownerItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },
  ownerIcon: {
    fontSize: "24px"
  },
  statusActive: {
    padding: "6px 12px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block"
  },
  statusMissing: {
    padding: "6px 12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    display: "inline-block"
  },
  fineHistory: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  fineItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "10px"
  },
  fineDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  fineAmount: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#ef4444"
  },
  fineReason: {
    fontSize: "15px",
    color: "#374151",
    fontWeight: "500"
  },
  fineDate: {
    fontSize: "13px",
    color: "#6b7280"
  },
  pendingBadge: {
    padding: "8px 16px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  paidBadge: {
    padding: "8px 16px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase"
  },
  totalFines: {
    fontSize: "18px",
    color: "#ef4444",
    fontWeight: "700"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151"
  },
  input: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.3s",
    color: "#111827", // Ensure text is visible
    backgroundColor: "#ffffff" // Ensure background is white
  },
  textarea: {
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
    resize: "vertical",
    transition: "border-color 0.3s",
    color: "#111827", // Ensure text is visible
    backgroundColor: "#ffffff" // Ensure background is white
  },
  quickReasons: {
    marginBottom: "20px"
  },
  reasonButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "12px"
  },
  reasonButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "12px 16px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "2px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s"
  },
  reasonAmount: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500"
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
    transition: "all 0.3s"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center"
  },
  emptyIcon: {
    fontSize: "80px",
    marginBottom: "20px"
  },
  emptyTitle: {
    fontSize: "24px",
    color: "#374151",
    marginBottom: "12px"
  },
  emptyText: {
    fontSize: "16px",
    color: "#6b7280",
    maxWidth: "500px"
  }
};