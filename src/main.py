import converter
import parser
import label
import merge_short
import colon
import small_letter
import bullet
import utils
import sys


def main(args):
    threshold = -50
    document = converter.document_to_text(args[1])
    labeled = label.Label(document)
    parser.parse_document(document, labeled)
    merge_short.analyse(labeled.paragraph_list, labeled.find_max_line_width()-threshold)
    colon.analyse(labeled.paragraph_list)
    small_letter.analyse(labeled.paragraph_list)
    bullet.analyse(labeled.paragraph_list)
    labeled.print_list()
    labeled.write_to_file(utils.remove_extension(args[1]), utils.is_html(args[1]))

if __name__ == "__main__":
    main(sys.argv)
