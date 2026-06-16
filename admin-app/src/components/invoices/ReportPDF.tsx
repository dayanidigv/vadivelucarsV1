import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register Revue Std Bold font (matches invoice)
Font.register({
    family: 'Revue Std Bold',
    src: '/font/Revue Std Bold/Revue Std Bold.otf'
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        color: '#334155',
    },
    // Header
    header: {
        borderBottomWidth: 2,
        borderBottomColor: '#1e3a8a',
        paddingBottom: 10,
        marginBottom: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    headerLeft: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Revue Std Bold',
        color: '#1e3a8a',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 9,
        color: '#64748b',
        marginTop: 2,
        fontWeight: 'bold',
    },
    headerRight: {
        textAlign: 'right',
    },
    metaText: {
        fontSize: 7.5,
        color: '#64748b',
        lineHeight: 1.4,
    },
    // Layout Sections
    sectionTitle: {
        fontSize: 11,
        fontFamily: 'Revue Std Bold',
        color: '#1e3a8a',
        marginTop: 12,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 3,
    },
    // Metrics Grid
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    metricCard: {
        width: '31%',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        padding: 8,
        backgroundColor: '#f8fafc',
    },
    metricLabel: {
        fontSize: 7.5,
        color: '#64748b',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    metricValue: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    metricFootnote: {
        fontSize: 6.5,
        color: '#94a3b8',
        marginTop: 3,
    },
    // Table
    table: {
        flexDirection: 'column',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        height: 20,
        alignItems: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        minHeight: 18,
        alignItems: 'center',
    },
    tableHeaderCell: {
        fontSize: 7.5,
        fontWeight: 'bold',
        color: '#475569',
        padding: 4,
    },
    tableCell: {
        fontSize: 7.5,
        padding: 4,
    },
    // Column Widths
    colTrendName: { width: '25%' },
    colTrendBilled: { width: '25%', textAlign: 'right' },
    colTrendCollected: { width: '25%', textAlign: 'right' },
    colTrendCount: { width: '25%', textAlign: 'center' },

    colCatName: { width: '40%' },
    colCatCount: { width: '20%', textAlign: 'center' },
    colCatQty: { width: '20%', textAlign: 'right' },
    colCatAmount: { width: '20%', textAlign: 'right' },

    colCustName: { width: '35%' },
    colCustPhone: { width: '20%' },
    colCustBills: { width: '15%', textAlign: 'center' },
    colCustTotal: { width: '15%', textAlign: 'right' },
    colCustBal: { width: '15%', textAlign: 'right' },

    colItemDesc: { width: '45%' },
    colItemType: { width: '15%', textAlign: 'center' },
    colItemCount: { width: '13%', textAlign: 'right' },
    colItemQty: { width: '12%', textAlign: 'right' },
    colItemAmount: { width: '15%', textAlign: 'right' },

    colInvNo: { width: '12%' },
    colInvDate: { width: '15%' },
    colInvCustomer: { width: '30%' },
    colInvVehicle: { width: '18%' },
    colInvTotal: { width: '13%', textAlign: 'right' },
    colInvStatus: { width: '12%', textAlign: 'center' },

    // Breakdown Meter Row
    shareRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#f8fafc',
        marginBottom: 12,
        gap: 15,
    },
    shareCol: {
        flex: 1,
    },
    shareTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 4,
    },
    shareValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 9,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 3,
    },
    shareBarBg: {
        height: 5,
        backgroundColor: '#cbd5e1',
        borderRadius: 2.5,
        overflow: 'hidden',
    },
    shareBarFill: {
        height: '100%',
        borderRadius: 2.5,
    },
    // Two Column Analytics
    twoColRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    twoCol: {
        flex: 1,
    },
    // Footer / Page Number
    pageNumber: {
        position: 'absolute',
        fontSize: 7.5,
        color: '#94a3b8',
        bottom: 15,
        left: 0,
        right: 0,
        textAlign: 'center',
    },
})

interface ReportPDFProps {
    rangeLabel: string
    summary: {
        totalRevenue: number
        totalCollected: number
        totalOutstanding: number
        totalParts: number
        totalLabor: number
        totalDiscounts: number
        count: number
        avgTicketSize: number
    }
    monthly: any[]
    daily: any[]
    methodDistribution: any[]
    itemBreakdown: any[]
    categoryBreakdown: any[]
    topCustomers: any[]
    outstandingInvoices: any[]
    invoices: any[]
}

export default function ReportPDF({
    rangeLabel,
    summary,
    monthly,
    daily,
    methodDistribution,
    itemBreakdown,
    categoryBreakdown = [],
    topCustomers = [],
    outstandingInvoices = [],
    invoices
}: ReportPDFProps) {
    const runDate = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    })

    const partsPercentage = summary.totalParts + summary.totalLabor > 0
        ? Math.round((summary.totalParts / (summary.totalParts + summary.totalLabor)) * 100)
        : 0

    // Decide whether to print Daily trend (for shorter ranges <= 31 days) or Monthly trend
    const showDailyTrend = daily && daily.length > 0 && daily.length <= 31
    const trendData = showDailyTrend ? daily : monthly

    return (
        <Document>
            {/* PAGE 1: EXECUTIVE OVERVIEW & TRENDS */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>VADIVELU CARS</Text>
                        <Text style={styles.subtitle}>Financial & Sales Analytics Report</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.metaText}>Timeframe: {rangeLabel}</Text>
                        <Text style={styles.metaText}>Generated: {runDate}</Text>
                    </View>
                </View>

                {/* Section: Executive Summary */}
                <Text style={styles.sectionTitle}>Executive Summary</Text>

                {/* Metrics Cards */}
                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Gross Billed</Text>
                        <Text style={styles.metricValue}>Rs. {summary.totalRevenue.toLocaleString('en-IN')}</Text>
                        <Text style={styles.metricFootnote}>{summary.count} Total Invoices</Text>
                    </View>
                    <View style={{ ...styles.metricCard, borderColor: '#10b981', backgroundColor: '#f0fdf4' }}>
                        <Text style={{ ...styles.metricLabel, color: '#059669' }}>Collected Cash</Text>
                        <Text style={{ ...styles.metricValue, color: '#065f46' }}>Rs. {summary.totalCollected.toLocaleString('en-IN')}</Text>
                        <Text style={styles.metricFootnote}>Inflows collected</Text>
                    </View>
                    <View style={{ ...styles.metricCard, borderColor: '#f59e0b', backgroundColor: '#fffbeb' }}>
                        <Text style={{ ...styles.metricLabel, color: '#d97706' }}>Outstanding Balance</Text>
                        <Text style={{ ...styles.metricValue, color: '#92400e' }}>Rs. {summary.totalOutstanding.toLocaleString('en-IN')}</Text>
                        <Text style={styles.metricFootnote}>Remaining collections</Text>
                    </View>
                </View>

                <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Average Ticket Size</Text>
                        <Text style={styles.metricValue}>Rs. {Math.round(summary.avgTicketSize).toLocaleString('en-IN')}</Text>
                        <Text style={styles.metricFootnote}>Avg value per bill</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Discounts Awarded</Text>
                        <Text style={{ ...styles.metricValue, color: '#b91c1c' }}>Rs. {summary.totalDiscounts.toLocaleString('en-IN')}</Text>
                        <Text style={styles.metricFootnote}>Total promotional relief</Text>
                    </View>
                    <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Billed Parts & Labor</Text>
                        <Text style={styles.metricValue}>Rs. {(summary.totalParts + summary.totalLabor).toLocaleString('en-IN')}</Text>
                        <Text style={styles.metricFootnote}>Excluding discounts</Text>
                    </View>
                </View>

                {/* Section: Revenue Allocation Share */}
                <View style={styles.shareRow}>
                    <View style={styles.shareCol}>
                        <Text style={styles.shareTitle}>Parts vs Labor Sales Share</Text>
                        <View style={styles.shareValueRow}>
                            <Text>Parts: {partsPercentage}% (Rs. {summary.totalParts.toLocaleString('en-IN')})</Text>
                            <Text>Labor: {100 - partsPercentage}% (Rs. {summary.totalLabor.toLocaleString('en-IN')})</Text>
                        </View>
                        <View style={styles.shareBarBg}>
                            <View style={{ ...styles.shareBarFill, width: `${partsPercentage}%`, backgroundColor: '#3b82f6' }} />
                        </View>
                    </View>
                    <View style={styles.shareCol}>
                        <Text style={styles.shareTitle}>Total Discount Ratio</Text>
                        <View style={styles.shareValueRow}>
                            <Text>Discounts Awarded: {summary.totalRevenue > 0 ? ((summary.totalDiscounts / summary.totalRevenue) * 100).toFixed(1) : 0}%</Text>
                            <Text>Net Inflow: {summary.totalRevenue > 0 ? (100 - (summary.totalDiscounts / summary.totalRevenue) * 100).toFixed(1) : 100}%</Text>
                        </View>
                        <View style={styles.shareBarBg}>
                            <View style={{ ...styles.shareBarFill, width: `${summary.totalRevenue > 0 ? (summary.totalDiscounts / summary.totalRevenue) * 100 : 0}%`, backgroundColor: '#ef4444' }} />
                        </View>
                    </View>
                </View>

                {/* Section: Trend Breakdown (Conditional Daily/Monthly) */}
                {trendData && trendData.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>{showDailyTrend ? 'Daily Sales Trend (Time Window)' : 'Monthly Sales Trend'}</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <View style={[styles.tableHeaderCell, styles.colTrendName]}><Text>{showDailyTrend ? 'Date' : 'Month'}</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colTrendBilled]}><Text>Billed Amount</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colTrendCollected]}><Text>Collected Cash</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colTrendCount]}><Text>Invoices Count</Text></View>
                            </View>
                            {trendData.slice(0, 18).map((row: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <View style={[styles.tableCell, styles.colTrendName]}><Text style={{ fontWeight: 'bold' }}>{row.name}</Text></View>
                                    <View style={[styles.tableCell, styles.colTrendBilled]}><Text>Rs. {Math.round(row.revenue).toLocaleString('en-IN')}</Text></View>
                                    <View style={[styles.tableCell, styles.colTrendCollected]}><Text style={{ color: '#065f46' }}>Rs. {Math.round(row.collected).toLocaleString('en-IN')}</Text></View>
                                    <View style={[styles.tableCell, styles.colTrendCount]}><Text>{row.count} bills</Text></View>
                                </View>
                            ))}
                        </View>
                        {showDailyTrend && trendData.length > 18 && (
                            <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#64748b', textAlign: 'center' }}>
                                Showing first 18 days. Complete daily stats are plotted in the interactive dashboard graph.
                            </Text>
                        )}
                    </View>
                )}

                <Text style={styles.pageNumber}>Page 1 of 3</Text>
            </Page>

            {/* PAGE 2: BUSINESS INSIGHTS, TOP CLIENTS & CATEGORIES */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>VADIVELU CARS</Text>
                        <Text style={styles.subtitle}>VIP Clients & Item Category Breakdown</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.metaText}>Generated: {runDate}</Text>
                    </View>
                </View>

                {/* Top Customers Section */}
                {topCustomers && topCustomers.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Top Customers by Sales Contribution</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <View style={[styles.tableHeaderCell, styles.colCustName]}><Text>Customer Name</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colCustPhone]}><Text>Phone</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colCustBills]}><Text>Bills Count</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colCustTotal]}><Text>Total Billed</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colCustBal]}><Text>Outstanding</Text></View>
                            </View>
                            {topCustomers.slice(0, 6).map((cust: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <View style={[styles.tableCell, styles.colCustName]}><Text style={{ fontWeight: 'bold' }}>{cust.name}</Text></View>
                                    <View style={[styles.tableCell, styles.colCustPhone]}><Text>{cust.phone || 'N/A'}</Text></View>
                                    <View style={[styles.tableCell, styles.colCustBills]}><Text>{cust.count} visits</Text></View>
                                    <View style={[styles.tableCell, styles.colCustTotal]}><Text>Rs. {Math.round(cust.total).toLocaleString('en-IN')}</Text></View>
                                    <View style={[styles.tableCell, styles.colCustBal]}><Text style={{ color: cust.balance > 0 ? '#b91c1c' : '#334155' }}>Rs. {Math.round(cust.balance).toLocaleString('en-IN')}</Text></View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Two columns for distributions */}
                <View style={styles.twoColRow}>
                    {/* Category Sales Breakdown */}
                    <View style={styles.twoCol}>
                        <Text style={styles.sectionTitle}>Sales Share by Category</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <View style={[styles.tableHeaderCell, styles.colCatName]}><Text>Category</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colCatCount]}><Text>Items Count</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colCatAmount]}><Text>Revenue</Text></View>
                            </View>
                            {categoryBreakdown.slice(0, 6).map((cat: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <View style={[styles.tableCell, styles.colCatName]}><Text style={{ fontWeight: 'bold' }}>{cat.category}</Text></View>
                                    <View style={[styles.tableCell, styles.colCatCount]}><Text>{cat.count} sold</Text></View>
                                    <View style={[styles.tableCell, styles.colCatAmount]}><Text>Rs. {Math.round(cat.amount).toLocaleString('en-IN')}</Text></View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Payment preference */}
                    <View style={styles.twoCol}>
                        <Text style={styles.sectionTitle}>Payment Preference</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <View style={{ ...styles.tableHeaderCell, flex: 2 }}><Text>Method</Text></View>
                                <View style={{ ...styles.tableHeaderCell, flex: 1.2, textAlign: 'center' }}><Text>Tx Volume</Text></View>
                                <View style={{ ...styles.tableHeaderCell, flex: 2, textAlign: 'right' }}><Text>Total Value</Text></View>
                            </View>
                            {methodDistribution.map((method: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <View style={{ ...styles.tableCell, flex: 2 }}><Text style={{ fontWeight: 'bold' }}>{method.name}</Text></View>
                                    <View style={{ ...styles.tableCell, flex: 1.2, textAlign: 'center' }}><Text>{method.value} tx</Text></View>
                                    <View style={{ ...styles.tableCell, flex: 2, textAlign: 'right' }}><Text>Rs. {Math.round(method.amount).toLocaleString('en-IN')}</Text></View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Section: Top-selling Parts and Services */}
                <Text style={styles.sectionTitle}>Top Parts & Services Breakdown (By Revenue)</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={[styles.tableHeaderCell, styles.colItemDesc]}><Text>Spare Part / Service Description</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colItemType]}><Text>Type</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colItemCount]}><Text>Frequency</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colItemQty]}><Text>Qty Sold</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colItemAmount]}><Text>Revenue</Text></View>
                    </View>
                    {itemBreakdown.slice(0, 10).map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.colItemDesc]}><Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{item.description}</Text></View>
                            <View style={[styles.tableCell, styles.colItemType]}><Text style={{ color: item.item_type === 'part' ? '#1d4ed8' : '#6b21a8' }}>{item.item_type?.toUpperCase()}</Text></View>
                            <View style={[styles.tableCell, styles.colItemCount]}><Text>{item.count} times</Text></View>
                            <View style={[styles.tableCell, styles.colItemQty]}><Text>{item.quantity}</Text></View>
                            <View style={[styles.tableCell, styles.colItemAmount]}><Text style={{ fontWeight: 'bold' }}>Rs. {Math.round(item.amount).toLocaleString('en-IN')}</Text></View>
                        </View>
                    ))}
                </View>

                <Text style={styles.pageNumber}>Page 2 of 3</Text>
            </Page>

            {/* PAGE 3: RECEIVABLES LOG & TRANSACTIONS */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>VADIVELU CARS</Text>
                        <Text style={styles.subtitle}>Outstanding Accounts & Recent Bills Log</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.metaText}>Generated: {runDate}</Text>
                    </View>
                </View>

                {/* Section: Outstanding Invoices */}
                {outstandingInvoices && outstandingInvoices.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>Outstanding Accounts (Invoices Awaiting Settlement)</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <View style={[styles.tableHeaderCell, styles.colInvNo]}><Text>Invoice #</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colInvDate]}><Text>Bill Date</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colInvCustomer]}><Text>Customer Contact</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colInvVehicle]}><Text>Vehicle No.</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colInvTotal]}><Text>Collected</Text></View>
                                <View style={[styles.tableHeaderCell, styles.colInvStatus]}><Text>Outstanding</Text></View>
                            </View>
                            {outstandingInvoices.slice(0, 10).map((inv: any, i: number) => (
                                <View key={i} style={styles.tableRow}>
                                    <View style={[styles.tableCell, styles.colInvNo]}><Text style={{ fontWeight: 'bold' }}>#{inv.invoice_number}</Text></View>
                                    <View style={[styles.tableCell, styles.colInvDate]}><Text>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</Text></View>
                                    <View style={[styles.tableCell, styles.colInvCustomer]}>
                                        <Text>{inv.customer_name}</Text>
                                        <Text style={{ fontSize: 6.5, color: '#ef4444' }}>{inv.customer_phone}</Text>
                                    </View>
                                    <View style={[styles.tableCell, styles.colInvVehicle]}><Text>{inv.vehicle_number}</Text></View>
                                    <View style={[styles.tableCell, styles.colInvTotal]}><Text>Rs. {Number(inv.paid_amount).toLocaleString('en-IN')}</Text></View>
                                    <View style={[styles.tableCell, styles.colInvStatus]}>
                                        <Text style={{ fontWeight: 'bold', color: '#b91c1c' }}>Rs. {Number(inv.balance_amount).toLocaleString('en-IN')}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                        {outstandingInvoices.length > 10 && (
                            <Text style={{ fontSize: 7, fontStyle: 'italic', color: '#64748b', textAlign: 'center', marginBottom: 6 }}>
                                Showing top 10 outstanding bills. Total {outstandingInvoices.length} unpaid files are logged.
                            </Text>
                        )}
                    </View>
                )}

                <Text style={styles.sectionTitle}>Invoices Log (Recent transactions)</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={[styles.tableHeaderCell, styles.colInvNo]}><Text>Bill #</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colInvDate]}><Text>Date</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colInvCustomer]}><Text>Customer</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colInvVehicle]}><Text>Vehicle</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colInvTotal]}><Text>Amount</Text></View>
                        <View style={[styles.tableHeaderCell, styles.colInvStatus]}><Text>Status</Text></View>
                    </View>
                    {invoices.slice(0, 18).map((inv: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.colInvNo]}><Text style={{ fontWeight: 'bold' }}>#{inv.invoice_number}</Text></View>
                            <View style={[styles.tableCell, styles.colInvDate]}><Text>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</Text></View>
                            <View style={[styles.tableCell, styles.colInvCustomer]}><Text>{inv.customer_name}</Text></View>
                            <View style={[styles.tableCell, styles.colInvVehicle]}><Text>{inv.vehicle_number}</Text></View>
                            <View style={[styles.tableCell, styles.colInvTotal]}><Text style={{ fontWeight: 'bold' }}>Rs. {Number(inv.grand_total).toLocaleString('en-IN')}</Text></View>
                            <View style={[styles.tableCell, styles.colInvStatus]}>
                                <Text style={{
                                    fontSize: 7,
                                    fontWeight: 'bold',
                                    color: inv.payment_status === 'paid' ? '#065f46' : inv.payment_status === 'partial' ? '#92400e' : '#991b1b'
                                }}>
                                    {inv.payment_status?.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {invoices.length > 18 && (
                    <Text style={{ fontSize: 7.5, fontStyle: 'italic', color: '#64748b', textAlign: 'center', marginTop: 4 }}>
                        Export CSV for the complete transaction list of {invoices.length} invoices.
                    </Text>
                )}

                <Text style={styles.pageNumber}>Page 3 of 3</Text>
            </Page>
        </Document>
    )
}
