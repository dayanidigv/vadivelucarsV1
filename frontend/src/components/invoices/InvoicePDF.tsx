import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 20,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#000000',
    },
    container: {
        borderWidth: 1,
        borderColor: '#14532d', // Dark green like the image
        height: '98%',
        flexDirection: 'column',
        display: 'flex',
    },
    // Header Section
    headerContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#14532d',
        height: 120, // Fixed height for header area
    },
    headerLeft: {
        width: '55%',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#14532d',
    },
    headerRight: {
        width: '45%',
        padding: 8,
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#14532d',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#14532d',
    },
    address: {
        fontSize: 9,
        textAlign: 'center',
        marginBottom: 2,
        lineHeight: 1.3,
    },
    contact: {
        fontSize: 9,
        textAlign: 'center',
        marginTop: 2,
    },
    // Customer Details Grid in Header
    customerRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    customerLabel: {
        width: 80,
        fontSize: 9,
        fontWeight: 'bold',
    },
    customerValue: {
        flex: 1,
        fontSize: 9,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderStyle: 'dotted',
        paddingBottom: 1,
    },
    billNoRow: {
        flexDirection: 'row',
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    billNoLabel: {
        fontSize: 9,
        marginRight: 4,
    },
    billNoValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#d32f2f', // Red color for bill no as seen in some invoices, or keep black
    },

    // Main Content
    contentContainer: {
        flex: 1,
        flexDirection: 'column',
    },

    // Grid Table Header
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#14532d',
        backgroundColor: '#e6f4ea', // Light green bg for header
        height: 25,
        alignItems: 'center',
    },
    // Grid Columns
    colSl: { width: '8%', borderRightWidth: 1, borderRightColor: '#14532d', textAlign: 'center', height: '100%', justifyContent: 'center' },
    colDesc: { width: '42%', borderRightWidth: 1, borderRightColor: '#14532d', paddingLeft: 4, height: '100%', justifyContent: 'center' },
    colQty: { width: '10%', borderRightWidth: 1, borderRightColor: '#14532d', textAlign: 'center', height: '100%', justifyContent: 'center' },
    colRate: { width: '12%', borderRightWidth: 1, borderRightColor: '#14532d', textAlign: 'center', height: '100%', justifyContent: 'center' },
    colAmount: { width: '14%', borderRightWidth: 1, borderRightColor: '#14532d', textAlign: 'center', height: '100%', justifyContent: 'center' },
    colLabour: { width: '14%', textAlign: 'center', height: '100%', justifyContent: 'center' },

    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#14532d',
    },

    // Table Rows
    tableRow: {
        flexDirection: 'row',
        height: 20, // Fixed height per row or min-height
        // items will occupy space
    },
    cellText: { fontSize: 9, paddingTop: 4 },
    cellTextRight: { fontSize: 9, paddingTop: 4, paddingRight: 4, textAlign: 'right' },

    // Vertical Lines container for the empty space
    verticalLinesContainer: {
        flexDirection: 'row',
        flex: 1, // Takes remaining space
    },
    vLineSl: { width: '8%', borderRightWidth: 1, borderRightColor: '#14532d' },
    vLineDesc: { width: '42%', borderRightWidth: 1, borderRightColor: '#14532d' },
    vLineQty: { width: '10%', borderRightWidth: 1, borderRightColor: '#14532d' },
    vLineRate: { width: '12%', borderRightWidth: 1, borderRightColor: '#14532d' },
    vLineAmount: { width: '14%', borderRightWidth: 1, borderRightColor: '#14532d' },
    vLineLabour: { width: '14%' },

    // Footer
    footerSection: {
        borderTopWidth: 1,
        borderTopColor: '#14532d',
        height: 100,
        flexDirection: 'column',
    },
    totalRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#14532d',
        height: 20,
    },
    totalLabelBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 10,
        borderRightWidth: 1,
        borderRightColor: '#14532d',
    },
    totalValueBox: {
        width: '28%', // Matches amount + labour width mostly
        justifyContent: 'center',
        paddingRight: 10,
        alignItems: 'flex-end',
    },
    footerBottom: {
        flex: 1,
        flexDirection: 'row',
        padding: 5,
    },
    footerLeft: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    footerRight: {
        width: 200,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 5,
    },
    signatureLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#14532d',
        marginBottom: 30,
    },
    signatureLine: {
        fontSize: 9,
    },
    noteText: {
        fontSize: 8,
        fontStyle: 'italic',
        marginTop: 5,
    },
    topLabel: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        paddingVertical: 2,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#14532d'
    }
})

export default function InvoicePDF({ invoice }: { invoice: any }) {
    // Separate items by type or just list them
    // If we want to emulate the picture, we might list them all.
    // The picture shows Parts having 'Amount' and empty 'Labour'.
    // We will follow that logic.

    const items = invoice.items || []
    const totalAmount = invoice.grand_total || 0
    // Fill empty rows to make the grid look like the paper form
    const minRows = 15
    const emptyRows = Math.max(0, minRows - items.length)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    {/* Top Label */}
                    <Text style={styles.topLabel}>LABOUR / CASH BILL</Text>

                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerLeft}>
                            {/* Logo Placeholder - Text for now */}
                            <Text style={styles.title}>VADIVELU CARS</Text>
                            <Text style={styles.subtitle}>MULTI CAR SERVICE & EXPRESS CAR SERVICE</Text>
                            <Text style={styles.address}>
                                Near HP Petrol Bunk, Kondalampatty Bye-Pass Road,{'\n'}
                                SALEM - 636 010.
                            </Text>
                            <Text style={styles.contact}>
                                Cell : 89036 26677, 80125 26677
                                Email : vadivelucars@gmail.com
                            </Text>
                        </View>
                        <View style={styles.headerRight}>
                            <View style={styles.customerRow}>
                                <Text style={styles.customerLabel}>Customer Name :</Text>
                                <Text style={styles.customerValue}>{invoice.customer?.name}</Text>
                            </View>
                            <View style={styles.customerRow}>
                                <Text style={styles.customerLabel}>Vehicle No. :</Text>
                                <Text style={styles.customerValue}>{invoice.vehicle?.vehicle_number}</Text>
                            </View>
                            <View style={styles.customerRow}>
                                <Text style={styles.customerLabel}>Model :</Text>
                                <Text style={styles.customerValue}>{invoice.vehicle?.make} {invoice.vehicle?.model}</Text>
                            </View>
                            <View style={styles.customerRow}>
                                <Text style={styles.customerLabel}>Mileage (Km.) :</Text>
                                <Text style={styles.customerValue}>{invoice.mileage}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                <View style={{ flexDirection: 'row', flex: 1 }}>
                                    <Text style={styles.customerLabel}>Date :</Text>
                                    <Text style={{ ...styles.customerValue, flex: 0, width: 60 }}>
                                        {new Date(invoice.created_at).toLocaleDateString("en-GB")}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold' }}>No. </Text>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#14532d' }}>
                                        {invoice.id.substring(0, 6).toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <View style={styles.colSl}><Text style={styles.headerText}>Sl. No.</Text></View>
                        <View style={styles.colDesc}><Text style={styles.headerText}>PART DESCRIPTION</Text></View>
                        <View style={styles.colQty}><Text style={styles.headerText}>QTY</Text></View>
                        <View style={styles.colRate}><Text style={styles.headerText}>RATE{'\n'}(Rs.)</Text></View>
                        <View style={styles.colAmount}><Text style={styles.headerText}>AMOUNT{'\n'}(Rs.)</Text></View>
                        <View style={styles.colLabour}><Text style={styles.headerText}>LABOUR{'\n'}(Rs.)</Text></View>
                    </View>

                    {/* Table Items */}
                    <View style={styles.contentContainer}>
                        {items.map((item: any, index: number) => {
                            const isLabor = item.item_type === 'labor';
                            return (
                                <View key={index} style={styles.tableRow}>
                                    <View style={styles.colSl}><Text style={styles.cellText}>{index + 1}</Text></View>
                                    <View style={styles.colDesc}><Text style={{ ...styles.cellText, textAlign: 'left', paddingLeft: 4 }}>{item.description}</Text></View>
                                    <View style={styles.colQty}><Text style={styles.cellText}>{item.quantity}</Text></View>
                                    <View style={styles.colRate}><Text style={styles.cellTextRight}>{Number(item.rate).toFixed(2)}</Text></View>
                                    <View style={styles.colAmount}>
                                        <Text style={styles.cellTextRight}>{!isLabor ? Number(item.amount).toFixed(2) : ''}</Text>
                                    </View>
                                    <View style={styles.colLabour}>
                                        <Text style={styles.cellTextRight}>{isLabor ? Number(item.amount).toFixed(2) : ''}</Text>
                                    </View>
                                </View>
                            )
                        })}
                        {/* Empty Rows to fill space */}
                        {Array.from({ length: emptyRows }).map((_, i) => (
                            <View key={`empty-${i}`} style={styles.tableRow}>
                                <View style={styles.colSl}><Text></Text></View>
                                <View style={styles.colDesc}><Text></Text></View>
                                <View style={styles.colQty}><Text></Text></View>
                                <View style={styles.colRate}><Text></Text></View>
                                <View style={styles.colAmount}><Text></Text></View>
                                <View style={styles.colLabour}><Text></Text></View>
                            </View>
                        ))}

                        {/* Only vertical lines rendered over the empty space? 
                            Actually, rendering explicit empty rows with borders is easier to maintain the grid look.
                        */}
                    </View>

                    {/* Total Section */}
                    <View style={styles.footerSection}>
                        <View style={styles.totalRow}>
                            <View style={styles.totalLabelBox}>
                                <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
                            </View>
                            <View style={styles.totalValueBox}>
                                <Text style={{ fontWeight: 'bold' }}>{totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={styles.totalRow}>
                            <View style={styles.totalLabelBox}>
                                <Text style={{ fontWeight: 'bold' }}>GRAND TOTAL</Text>
                            </View>
                            <View style={styles.totalValueBox}>
                                <Text style={{ fontWeight: 'bold' }}>{totalAmount.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={styles.footerBottom}>
                            <View style={styles.footerLeft}>
                                <Text style={styles.noteText}>*Materials once sold cannot be Taken Back</Text>
                            </View>
                            <View style={styles.footerRight}>
                                <Text style={styles.signatureLabel}>For VADIVELU CARS</Text>
                                <Text style={styles.signatureLine}>Authorised Signature</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
