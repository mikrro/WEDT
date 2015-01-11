import converter
import parser
import label
import merge_short
import sys


def main(args):
    sys.setrecursionlimit(10000)
    document = converter.document_to_text(args[1])
    labeled = label.Label(document)
    parser.parse_document(document, labeled)
    labeled.paragraph_list = merge_short.merge_shorter_than(labeled.paragraph_list, labeled.find_max_line_width()/2)
    labeled.print_list()
    labeled.write_to_file()

if __name__ == "__main__":
    main(sys.argv)
