class Label:
    def __init__(self, document):
        """

        :rtype : String
        """
        self.text = document
        self.labeled_text = ''

    def paragraph(self, begin, end):
        self.labeled_text += '<p>'
        self.labeled_text += self.text[begin:end]
        self.labeled_text += '</p>'
        self.labeled_text += '\n'

    def print_text(self):
        print self.text

    def print_labeled(self):
        print self.labeled_text

    def write_to_file(self):
        f = open('labeled','w')
        f.write(self.labeled_text)