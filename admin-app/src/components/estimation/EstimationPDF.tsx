import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import DOMPurify from 'dompurify'
import type { Estimation, EstimationItem } from '@/types'

function sanitizeText(text: string | undefined | null): string {
    if (!text) return ''
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

Font.register({
    family: 'Revue Std Bold',
    src: '/font/Revue Std Bold/Revue Std Bold.otf'
});

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
    // Header
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
    topLabel: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        paddingVertical: 2,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#14532d'
    },
    // Table
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#14532d',
        backgroundColor: '#e6f4ea',
        height: 25,
        alignItems: 'center',
    },
    colNo: { width: '7%', borderRightWidth: 1, borderRightColor: '#14532d', textAlign: 'center', height: '100%', justifyContent: 'center' },
    colPartNo: { width: '15%', borderRightWidth: 1, borderRightColor: '#14532d', paddingLeft: 4, height: '100%', justifyContent: 'center' },
    colPartName: { width: '35%', borderRightWidth: 1, borderRightColor: '#14532d', paddingLeft: 4, height: '100%', justifyContent: 'center' },
    colUnitPrice: { width: '15%', borderRightWidth: 1, borderRightColor: '#14532d', textAlign: 'center', height: '100%', justifyContent: 'center' },
    colQty: { width: '10%', borderRightWidth: 1, borderRightColor: '#14532d', textAlign: 'center', height: '100%', justifyContent: 'center' },
    colAmount: { width: '18%', textAlign: 'center', height: '100%', justifyContent: 'center' },
    headerText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#14532d',
    },
    // Rows
    contentContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    tableRow: {
        flexDirection: 'row',
        minHeight: 20,
    },
    cellText: {
        fontSize: 9,
        paddingTop: 4,
        lineHeight: 1.3,
    },
    cellTextRight: {
        fontSize: 9,
        paddingTop: 4,
        paddingRight: 4,
        textAlign: 'right',
        lineHeight: 1.3,
    },
    // Footer
    footerSection: {
        borderTopWidth: 1,
        borderTopColor: '#14532d',
        minHeight: 100,
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
        width: '18%',
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
    // Watermark
    watermark: {
        position: 'absolute',
        top: '40%',
        left: '25%',
        fontSize: 60,
        color: '#e0e0e0',
        opacity: 0.3,
        transform: 'rotate(-30deg)',
        fontWeight: 'bold',
    },
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

export default function EstimationPDF({ estimation }: { estimation: Estimation }) {
    if (!estimation) {
        return <Document><Page><Text>Invalid estimation data</Text></Page></Document>;
    }

    if (!estimation.items || estimation.items.length === 0) {
        return <Document><Page><Text>No items in estimation</Text></Page></Document>;
    }

    if (!estimation.customer || !estimation.vehicle) {
        return <Document><Page><Text>Missing customer or vehicle data</Text></Page></Document>;
    }

    const items = estimation.items;
    const isDraft = estimation.status === 'draft';

    const subtotal = items.reduce((sum, i) => sum + Number(i.amount), 0);
    const discount = Number(estimation.discount_amount) || 0;
    const totalAmount = subtotal - discount;

    // Pagination
    const itemsPerPage = 30;
    const minRowsLastPage = 15;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const pages: EstimationItem[][] = [];
    for (let i = 0; i < totalPages; i++) {
        const start = i * itemsPerPage;
        const end = Math.min(start + itemsPerPage, items.length);
        pages.push(items.slice(start, end));
    }

    return (
        <Document>
            {pages.map((pageItems: EstimationItem[], pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === totalPages - 1;
                const startItemIndex = pageIndex * itemsPerPage;

                const emptyRows = isLastPage && pageItems.length < minRowsLastPage
                    ? minRowsLastPage - pageItems.length
                    : 0;

                return (
                    <Page key={pageIndex} size="A4" style={styles.page}>
                        <View style={styles.container}>
                            {/* Draft Watermark */}
                            {isDraft && (
                                <Text style={styles.watermark}>DRAFT</Text>
                            )}

                            {/* Top Label */}
                            <Text style={styles.topLabel}>
                                ESTIMATION - SPARES CHARGES {!isFirstPage ? `(Page ${pageIndex + 1} of ${totalPages})` : ''}
                            </Text>

                            {/* Header */}
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
                                            <Text style={styles.customerValue}>{sanitizeText(estimation.customer?.name)}</Text>
                                        </View>
                                        <View style={styles.customerRow}>
                                            <Text style={styles.customerLabel}>Contact Mobile :</Text>
                                            <Text style={styles.customerValue}>{sanitizeText(estimation.customer?.phone)}</Text>
                                        </View>
                                        <View style={styles.customerRow}>
                                            <Text style={styles.customerLabel}>Vehicle No. :</Text>
                                            <Text style={styles.customerValue}>{sanitizeText(estimation.vehicle?.vehicle_number)}</Text>
                                        </View>
                                        <View style={styles.customerRow}>
                                            <Text style={styles.customerLabel}>Make / Model :</Text>
                                            <Text style={styles.customerValue}>{sanitizeText(estimation.vehicle?.make)} {sanitizeText(estimation.vehicle?.model)}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                                <Text style={styles.customerLabel}>Date :</Text>
                                                <Text style={{ ...styles.customerValue, flex: 0, width: 60 }}>
                                                    {estimation.estimation_date ? new Date(estimation.estimation_date).toLocaleDateString("en-GB") : ''}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>No. </Text>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#14532d' }}>
                                                    {estimation.estimation_number}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.continuationHeader}>
                                    <View>
                                        <Text style={styles.continuationText}>
                                            Estimation: {estimation.estimation_number} (Continued)
                                        </Text>
                                        <Text style={{ fontSize: 8, color: '#666' }}>
                                            {sanitizeText(estimation.customer?.name)} - {sanitizeText(estimation.vehicle?.vehicle_number)}
                                        </Text>
                                    </View>
                                    <Text style={styles.pageNumber}>Page {pageIndex + 1} of {totalPages}</Text>
                                </View>
                            )}

                            {/* Table Header */}
                            <View style={styles.tableHeader}>
                                <View style={styles.colNo}><Text style={styles.headerText}>NO.</Text></View>
                                <View style={styles.colPartNo}><Text style={styles.headerText}>PART NUMBER</Text></View>
                                <View style={styles.colPartName}><Text style={styles.headerText}>PART NAME</Text></View>
                                <View style={styles.colUnitPrice}><Text style={styles.headerText}>UNIT PRICE{'\n'}(Rs.)</Text></View>
                                <View style={styles.colQty}><Text style={styles.headerText}>QTY</Text></View>
                                <View style={styles.colAmount}><Text style={styles.headerText}>AMOUNT{'\n'}(Rs.)</Text></View>
                            </View>

                            {/* Items */}
                            <View style={styles.contentContainer}>
                                {pageItems.map((item, index) => {
                                    const globalIndex = startItemIndex + index;
                                    return (
                                        <View key={index} style={styles.tableRow}>
                                            <View style={styles.colNo}><Text style={styles.cellText}>{globalIndex + 1}</Text></View>
                                            <View style={styles.colPartNo}><Text style={{ ...styles.cellText, paddingLeft: 4 }}>{sanitizeText(item.part_number)}</Text></View>
                                            <View style={styles.colPartName}><Text style={{ ...styles.cellText, paddingLeft: 4 }}>{sanitizeText(item.description)}</Text></View>
                                            <View style={styles.colUnitPrice}><Text style={styles.cellTextRight}>{Number(item.rate).toFixed(2)}</Text></View>
                                            <View style={styles.colQty}><Text style={styles.cellText}>{item.quantity}</Text></View>
                                            <View style={styles.colAmount}><Text style={styles.cellTextRight}>{Number(item.amount).toFixed(2)}</Text></View>
                                        </View>
                                    )
                                })}

                                {/* Empty rows */}
                                {isLastPage && Array.from({ length: emptyRows }).map((_, i) => (
                                    <View key={`empty-${i}`} style={styles.tableRow}>
                                        <View style={styles.colNo}><Text></Text></View>
                                        <View style={styles.colPartNo}><Text></Text></View>
                                        <View style={styles.colPartName}><Text></Text></View>
                                        <View style={styles.colUnitPrice}><Text></Text></View>
                                        <View style={styles.colQty}><Text></Text></View>
                                        <View style={styles.colAmount}><Text></Text></View>
                                    </View>
                                ))}

                                {!isLastPage && (
                                    <View style={styles.continuationNotice}>
                                        <Text style={styles.continuationNoticeText}>
                                            ** Continued on next page **
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Footer - only last page */}
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
                                            <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 3 }}>
                                                *Valid for {estimation.validity_period || 15} days from date of issue
                                            </Text>
                                            {estimation.valid_until && (
                                                <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                                                    Valid until: {new Date(estimation.valid_until).toLocaleDateString("en-GB")}
                                                </Text>
                                            )}
                                            {!!estimation.notes && (
                                                <View style={{ marginTop: 6, padding: 4, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 2 }}>
                                                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#64748b', marginBottom: 2 }}>Notes:</Text>
                                                    <Text style={{ fontSize: 8, color: '#1e293b' }}>{sanitizeText(estimation.notes)}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.footerRight}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', marginTop: 10 }}>For VADIVELU CARS</Text>
                                            <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 30, textAlign: 'center' }}>
                                                Authorised Signatory
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
