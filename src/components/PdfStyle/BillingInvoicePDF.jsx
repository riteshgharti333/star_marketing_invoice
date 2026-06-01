// BillingInvoicePDF.jsx
import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import styles from "./BillingInvoicePDFStyles";

const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";

const BillingInvoicePDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {/* Left: Logo */}
        <View style={styles.logoContainer}>
          {/* If you have an image URL */}
          <Image style={styles.logo} src="/logo.png" />
        </View>

        {/* Right: Company Info */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>Your Company</Text>
          <Text style={styles.contactInfo}>
            +91 8580483491 | example@email.com
          </Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.invoiceTitle}>INVOICE</Text>
        <Text style={styles.subtitle}>Original Copy for Recipient</Text>
      </View>

      {/* Invoice Details */}
      <View style={styles.invoiceInfo}>
        <View>
          <Text>Invoice #: INV-002</Text>
          <Text>Invoice Date: 26 Apr 2025</Text>
          <Text>Due Date: 30 Apr 2025</Text>
        </View>
        <View>
          <Text>Customer:</Text>
          <Text>Suraj</Text>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCol}>#</Text>
          <Text style={styles.tableColItem}>Item</Text>
          <Text style={styles.tableCol}>Rate</Text>
          <Text style={styles.tableCol}>Qty</Text>
          <Text style={styles.tableCol}>Amount</Text>
        </View>

        {/* Table Row */}
        <View style={styles.tableRow}>
          <Text style={styles.tableCol}>1</Text>
          <Text style={styles.tableColItem}>Banana</Text>
          <Text style={styles.tableCol}>₹40</Text>
          <Text style={styles.tableCol}>10</Text>
          <Text style={styles.tableCol}>₹400</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <Text>Total Items/Qty: 1 / 10</Text>
        <Text>Total (in words): Four Hundred Rupees Only</Text>
        <Text>Payable: ₹400</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Page 1 / 1 — Computer generated invoice, no signature required.
        </Text>
      </View>
    </Page>
  </Document>
);

export default BillingInvoicePDF;
