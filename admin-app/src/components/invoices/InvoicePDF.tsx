import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// TypeScript Interfaces for Type Safety
interface InvoiceItem {
    description: string
    quantity: number
    rate: number
    amount: number
    item_type: 'labor' | 'part'
    unit?: string
    category?: string
}

interface InvoiceCustomer {
    name: string
    phone?: string
    address?: string
}

interface InvoiceVehicle {
    vehicle_number: string
    make: string
    model: string
}

interface Invoice {
    id: string
    invoice_number: number
    created_at: string
    customer: InvoiceCustomer
    vehicle: InvoiceVehicle
    items: InvoiceItem[]
    mileage: number
    grand_total: number
    discount_amount: number
    mechanic_name?: string
    notes?: string
}

// Register custom font - using cleaner path
Font.register({
    family: 'Revue Std Bold',
    src: '/font/Revue Std Bold/Revue Std Bold.otf'
});

// Helper function to convert number to words (Indian format)
function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return '';

    const convertLessThanThousand = (n: number): string => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';
    if (crores > 0) result += convertLessThanThousand(crores) + ' Crore ';
    if (lakhs > 0) result += convertLessThanThousand(lakhs) + ' Lakh ';
    if (thousands > 0) result += convertLessThanThousand(thousands) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim();
}

// Convert amount to words with paise
function numberToWordsWithPaise(amount: number): string {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = '';

    if (rupees > 0) {
        result = numberToWords(rupees) + ' Rupees';
    } else {
        result = 'Zero Rupees';
    }

    if (paise > 0) {
        result += ' and ' + numberToWords(paise) + ' Paise';
    }

    return result + ' Only';
}

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
        borderColor: '#14532d',
        height: '98%',
        flexDirection: 'column',
        display: 'flex',
    },
    // Header Section
    headerContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#14532d',
        minHeight: 120,
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
        fontFamily: 'Revue Std Bold',
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
        minHeight: 20, // Changed to minHeight
    },
    cellText: {
        fontSize: 9,
        paddingTop: 4,
        lineHeight: 1.3, // Better text flow
    },
    cellTextRight: {
        fontSize: 9,
        paddingTop: 4,
        paddingRight: 4,
        textAlign: 'right',
        lineHeight: 1.3,
    },

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
        minHeight: 100, // Changed to minHeight
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
    },
    // Continuation page styles
    continuationHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#14532d',
        padding: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    continuationText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#14532d',
    },
    pageNumber: {
        fontSize: 9,
        color: '#666',
    },
    continuationNotice: {
        padding: 6,
        backgroundColor: '#e6f4ea',
        borderTopWidth: 1,
        borderTopColor: '#14532d',
    },
    continuationNoticeText: {
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#14532d',
    },
})

export default function InvoicePDF({ invoice }: { invoice: Invoice }) {
    // Validation guards
    if (!invoice) {
        return <Document><Page><Text>Invalid invoice data</Text></Page></Document>;
    }

    if (!invoice.items || invoice.items.length === 0) {
        return <Document><Page><Text>No items in invoice</Text></Page></Document>;
    }

    if (!invoice.customer || !invoice.vehicle) {
        return <Document><Page><Text>Missing customer or vehicle data</Text></Page></Document>;
    }

    const items = invoice.items;

    // Calculate totals from items for accuracy
    const partsTotal = items
        .filter(i => i.item_type === 'part')
        .reduce((sum, i) => sum + Number(i.amount), 0);

    const laborTotal = items
        .filter(i => i.item_type === 'labor')
        .reduce((sum, i) => sum + Number(i.amount), 0);

    const subtotal = partsTotal + laborTotal;
    const discount = invoice.discount_amount || 0;
    const totalAmount = subtotal - discount;

    // Validate against database value (log warning if mismatch)
    if (Math.abs(totalAmount - invoice.grand_total) > 0.01) {
        console.warn('Invoice total mismatch:', {
            calculated: totalAmount,
            stored: invoice.grand_total,
            invoiceId: invoice.id
        });
    }

    // Multi-page pagination logic
    const itemsPerPage = 30; // Fill pages completely with items
    const minRowsLastPage = 15; // Minimum rows on last page to make room for footer
    const totalPages = Math.ceil(items.length / itemsPerPage);

    // Split items into pages
    const pages: InvoiceItem[][] = [];
    for (let i = 0; i < totalPages; i++) {
        const start = i * itemsPerPage;
        const end = Math.min(start + itemsPerPage, items.length);
        pages.push(items.slice(start, end));
    }

    return (
        <Document>
            {pages.map((pageItems: InvoiceItem[], pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === totalPages - 1;
                const startItemIndex = pageIndex * itemsPerPage;

                // Only add empty rows on the last page
                const emptyRows = isLastPage && pageItems.length < minRowsLastPage
                    ? minRowsLastPage - pageItems.length
                    : 0;

                return (
                    <Page key={pageIndex} size="A4" style={styles.page}>
                        <View style={styles.container}>
                            {/* Top Label */}
                            <Text style={styles.topLabel}>
                                LABOUR / CASH BILL {!isFirstPage && `(Page ${pageIndex + 1} of ${totalPages})`}
                            </Text>

                            {/* Header - Full on first page, simplified on continuation */}
                            {isFirstPage ? (
                                <View style={styles.headerContainer}>
                                    <View style={styles.headerLeft}>
                                        <Text style={styles.title}>VADIVELU CARS</Text>
                                        <Text style={styles.subtitle}>MULTI CAR SERVICE & EXPRESS CAR SERVICE</Text>
                                        <Text style={styles.address}>
                                            Near HP Petrol Bunk, Opp. SM Nexa, Kondalampatti Bypass,{'\n'}
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
                                                    {invoice.invoice_number}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.continuationHeader}>
                                    <View>
                                        <Text style={styles.continuationText}>
                                            Invoice: {invoice.invoice_number} (Continued)
                                        </Text>
                                        <Text style={{ fontSize: 8, color: '#666' }}>
                                            {invoice.customer?.name} • {invoice.vehicle?.vehicle_number}
                                        </Text>
                                    </View>
                                    <Text style={styles.pageNumber}>Page {pageIndex + 1} of {totalPages}</Text>
                                </View>
                            )}

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
                                {pageItems.map((item, index) => {
                                    const isLabor = item.item_type === 'labor';
                                    const globalIndex = startItemIndex + index;

                                    return (
                                        <View key={index} style={styles.tableRow}>
                                            <View style={styles.colSl}><Text style={styles.cellText}>{globalIndex + 1}</Text></View>
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

                                {/* Empty Rows - ONLY on last page */}
                                {isLastPage && Array.from({ length: emptyRows }).map((_, i) => (
                                    <View key={`empty-${i}`} style={styles.tableRow}>
                                        <View style={styles.colSl}><Text></Text></View>
                                        <View style={styles.colDesc}><Text></Text></View>
                                        <View style={styles.colQty}><Text></Text></View>
                                        <View style={styles.colRate}><Text></Text></View>
                                        <View style={styles.colAmount}><Text></Text></View>
                                        <View style={styles.colLabour}><Text></Text></View>
                                    </View>
                                ))}

                                {/* Continuation notice - NOT on last page */}
                                {!isLastPage && (
                                    <View style={styles.continuationNotice}>
                                        <Text style={styles.continuationNoticeText}>
                                            ** Continued on next page **
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Total Section - ONLY on last page */}
                            {isLastPage && (
                                <View wrap={false} style={styles.footerSection}>
                                    <View style={styles.totalRow}>
                                        <View style={styles.totalLabelBox}>
                                            <Text style={{ fontWeight: 'bold' }}>TOTAL</Text>
                                        </View>
                                        <View style={styles.totalValueBox}>
                                            <Text style={{ fontWeight: 'bold' }}>{subtotal.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    {discount > 0 && (
                                        <View style={styles.totalRow}>
                                            <View style={styles.totalLabelBox}>
                                                <Text style={{ fontWeight: 'bold' }}>DISCOUNT</Text>
                                            </View>
                                            <View style={styles.totalValueBox}>
                                                <Text style={{ fontWeight: 'bold' }}>- {discount.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                    )}
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
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 4 }}>
                                                Rupees: {numberToWordsWithPaise(totalAmount)}
                                            </Text>
                                            <Text style={styles.noteText}>*Materials once sold cannot be Taken Back</Text>
                                        </View>
                                        <View style={styles.footerRight}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 10 }}>For VADIVELU CARS</Text>
                                            <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 20, textAlign: 'center', color: '#666' }}>
                                                System Generated Invoice{'\n'}Signature not required
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Page>
                )
            })}
        </Document>
    )
}
